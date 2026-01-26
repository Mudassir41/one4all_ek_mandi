import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE!;
const VOICE_BUCKET = process.env.VOICE_BUCKET!;
const USER_SESSIONS_TABLE = process.env.USER_SESSIONS_TABLE!;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface SendMessageRequest {
  chatId: string;
  message?: string;
  voiceMessage?: string; // Base64 encoded audio
  sourceLang: string;
  targetLang: string;
  messageType?: 'text' | 'voice' | 'image';
}

interface GetMessagesRequest {
  chatId: string;
  limit?: number;
  lastEvaluatedKey?: any;
}

interface CreateChatRequest {
  participantId: string; // The other user in the chat
  initialMessage?: string;
  productId?: string; // Optional: if chat is about a specific product
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Chat event:', JSON.stringify(event, null, 2));

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  };

  try {
    const path = event.path;
    const method = event.httpMethod;

    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    // Extract user from JWT token
    const user = await extractUserFromToken(event.headers.Authorization);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const queryParams = event.queryStringParameters || {};

    switch (true) {
      case method === 'POST' && path.includes('/chat') && !path.includes('/messages'):
        return await handleCreateChat(body as CreateChatRequest, user, headers);
      
      case method === 'POST' && path.includes('/messages'):
        const chatId = extractChatIdFromPath(path);
        return await handleSendMessage({ ...body, chatId }, user, headers);
      
      case method === 'GET' && path.includes('/messages'):
        const getChatId = extractChatIdFromPath(path);
        return await handleGetMessages({ ...queryParams, chatId: getChatId }, user, headers);
      
      case method === 'PUT' && path.includes('/messages'):
        const updateChatId = extractChatIdFromPath(path);
        return await handleMarkMessagesRead(updateChatId, user, headers);
      
      case method === 'GET' && path.includes('/chat'):
        return await handleGetUserChats(queryParams, user, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Chat service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handleCreateChat(request: CreateChatRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  const { participantId, initialMessage, productId } = request;

  try {
    // Create chat ID by sorting user IDs to ensure consistency
    const chatParticipants = [user.userId, participantId].sort();
    const chatId = `${chatParticipants[0]}-${chatParticipants[1]}`;

    // Check if chat already exists
    const existingChat = await docClient.send(new GetCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: {
        PK: `CHAT#${chatId}`,
        SK: 'METADATA',
      },
    }));

    if (existingChat.Item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          chatId,
          message: 'Chat already exists',
          existing: true,
        }),
      };
    }

    // Create chat metadata
    const chatMetadata = {
      PK: `CHAT#${chatId}`,
      SK: 'METADATA',
      chat_id: chatId,
      participants: [user.userId, participantId],
      created_by: user.userId,
      product_id: productId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: CONVERSATIONS_TABLE,
      Item: chatMetadata,
    }));

    // Send initial message if provided
    if (initialMessage) {
      await sendMessage(chatId, user.userId, participantId, {
        message: initialMessage,
        messageType: 'text',
        sourceLang: user.languages[0] || 'english',
        targetLang: 'english', // Default, would be determined by recipient's preference
      });
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        chatId,
        message: 'Chat created successfully',
      }),
    };
  } catch (error) {
    console.error('Create chat error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create chat',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleSendMessage(request: SendMessageRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  const { chatId, message, voiceMessage, sourceLang, targetLang, messageType = 'text' } = request;

  try {
    // Verify user is participant in the chat
    const chatMetadata = await docClient.send(new GetCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: {
        PK: `CHAT#${chatId}`,
        SK: 'METADATA',
      },
    }));

    if (!chatMetadata.Item || !chatMetadata.Item.participants.includes(user.userId)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to send messages in this chat' }),
      };
    }

    // Determine recipient
    const recipientId = chatMetadata.Item.participants.find((id: string) => id !== user.userId);

    const messageData = {
      message,
      voiceMessage,
      sourceLang,
      targetLang,
      messageType,
    };

    const messageId = await sendMessage(chatId, user.userId, recipientId, messageData);

    // Update chat metadata
    await docClient.send(new UpdateCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: {
        PK: `CHAT#${chatId}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET last_message_at = :timestamp, updated_at = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': new Date().toISOString(),
      },
    }));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        messageId,
        message: 'Message sent successfully',
      }),
    };
  } catch (error) {
    console.error('Send message error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleGetMessages(request: GetMessagesRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  const { chatId, limit = 50, lastEvaluatedKey } = request;

  try {
    // Verify user is participant in the chat
    const chatMetadata = await docClient.send(new GetCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: {
        PK: `CHAT#${chatId}`,
        SK: 'METADATA',
      },
    }));

    if (!chatMetadata.Item || !chatMetadata.Item.participants.includes(user.userId)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to view messages in this chat' }),
      };
    }

    // Get messages
    const response = await docClient.send(new QueryCommand({
      TableName: CONVERSATIONS_TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `CHAT#${chatId}`,
        ':sk': 'MSG#',
      },
      Limit: parseInt(limit.toString()),
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
      ScanIndexForward: false, // Most recent first
    }));

    // Generate signed URLs for voice messages
    const messagesWithSignedUrls = await Promise.all(
      (response.Items || []).map(async (message) => {
        if (message.original_audio || message.translated_audio) {
          return {
            ...message,
            original_audio: message.original_audio ? await generateSignedUrl(message.original_audio) : null,
            translated_audio: message.translated_audio ? await generateSignedUrl(message.translated_audio) : null,
          };
        }
        return message;
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messages: messagesWithSignedUrls,
        count: messagesWithSignedUrls.length,
        lastEvaluatedKey: response.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error('Get messages error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleMarkMessagesRead(chatId: string, user: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    // Verify user is participant in the chat
    const chatMetadata = await docClient.send(new GetCommand({
      TableName: CONVERSATIONS_TABLE,
      Key: {
        PK: `CHAT#${chatId}`,
        SK: 'METADATA',
      },
    }));

    if (!chatMetadata.Item || !chatMetadata.Item.participants.includes(user.userId)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to update messages in this chat' }),
      };
    }

    // Get unread messages for this user
    const unreadMessages = await docClient.send(new QueryCommand({
      TableName: CONVERSATIONS_TABLE,
      IndexName: 'UnreadIndex',
      KeyConditionExpression: 'recipient_id = :recipientId AND read_status = :readStatus',
      FilterExpression: 'begins_with(PK, :chatPrefix)',
      ExpressionAttributeValues: {
        ':recipientId': user.userId,
        ':readStatus': 'unread',
        ':chatPrefix': `CHAT#${chatId}`,
      },
    }));

    // Mark messages as read
    const updatePromises = (unreadMessages.Items || []).map(message =>
      docClient.send(new UpdateCommand({
        TableName: CONVERSATIONS_TABLE,
        Key: {
          PK: message.PK,
          SK: message.SK,
        },
        UpdateExpression: 'SET read_status = :readStatus, read_at = :readAt',
        ExpressionAttributeValues: {
          ':readStatus': 'read',
          ':readAt': new Date().toISOString(),
        },
      }))
    );

    await Promise.all(updatePromises);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Marked ${updatePromises.length} messages as read`,
        count: updatePromises.length,
      }),
    };
  } catch (error) {
    console.error('Mark messages read error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to mark messages as read',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleGetUserChats(queryParams: any, user: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { limit = 20, lastEvaluatedKey } = queryParams;

    // Get chats where user is a participant
    const response = await docClient.send(new QueryCommand({
      TableName: CONVERSATIONS_TABLE,
      IndexName: 'UserIndex',
      KeyConditionExpression: 'sender_id = :userId',
      FilterExpression: 'SK = :metadata',
      ExpressionAttributeValues: {
        ':userId': user.userId,
        ':metadata': 'METADATA',
      },
      Limit: parseInt(limit),
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
      ScanIndexForward: false, // Most recent first
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        chats: response.Items || [],
        count: (response.Items || []).length,
        lastEvaluatedKey: response.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error('Get user chats error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get user chats',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function sendMessage(chatId: string, senderId: string, recipientId: string, messageData: any): Promise<string> {
  const messageId = uuidv4();
  const timestamp = new Date().toISOString();
  let originalAudioUrl = null;
  let translatedAudioUrl = null;

  // Handle voice message upload
  if (messageData.voiceMessage) {
    const voiceKey = `chat/${chatId}/messages/${messageId}/original.mp3`;
    const voiceBuffer = Buffer.from(messageData.voiceMessage, 'base64');
    
    await s3Client.send(new PutObjectCommand({
      Bucket: VOICE_BUCKET,
      Key: voiceKey,
      Body: voiceBuffer,
      ContentType: 'audio/mpeg',
    }));

    originalAudioUrl = `s3://${VOICE_BUCKET}/${voiceKey}`;

    // In a real implementation, this would trigger translation service
    // For now, we'll just store the original audio URL
    translatedAudioUrl = originalAudioUrl;
  }

  // Create message record
  const message = {
    PK: `CHAT#${chatId}`,
    SK: `MSG#${timestamp}`,
    message_id: messageId,
    sender_id: senderId,
    recipient_id: recipientId,
    message_type: messageData.messageType,
    original_text: messageData.message,
    translated_text: messageData.message, // Would be translated in real implementation
    original_audio: originalAudioUrl,
    translated_audio: translatedAudioUrl,
    source_lang: messageData.sourceLang,
    target_lang: messageData.targetLang,
    read_status: 'unread',
    created_at: timestamp,
    ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days TTL
  };

  await docClient.send(new PutCommand({
    TableName: CONVERSATIONS_TABLE,
    Item: message,
  }));

  // Send real-time notification to recipient
  await notifyUser(recipientId, {
    type: 'new_message',
    chatId,
    messageId,
    senderId,
    messageType: messageData.messageType,
    preview: messageData.message?.substring(0, 100) || 'Voice message',
  });

  return messageId;
}

async function extractUserFromToken(authHeader?: string): Promise<any> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

function extractChatIdFromPath(path: string): string {
  const parts = path.split('/');
  const chatIndex = parts.findIndex(part => part === 'chat');
  return parts[chatIndex + 1];
}

async function generateSignedUrl(s3Url: string): Promise<string> {
  if (s3Url.startsWith('s3://')) {
    const [, , bucket, ...keyParts] = s3Url.split('/');
    const key = keyParts.join('/');
    
    try {
      return await getSignedUrl(
        s3Client,
        new GetObjectCommand({ Bucket: bucket, Key: key }),
        { expiresIn: 3600 } // 1 hour
      );
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return s3Url;
    }
  }
  return s3Url;
}

async function notifyUser(userId: string, notification: any): Promise<void> {
  try {
    // Store notification for real-time delivery
    await docClient.send(new PutCommand({
      TableName: USER_SESSIONS_TABLE,
      Item: {
        PK: `NOTIFICATION#${userId}`,
        SK: `NOTIF#${Date.now()}`,
        user_id: userId,
        notification,
        created_at: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours TTL
      },
    }));

    // In a real implementation, this would also send via WebSocket
    console.log('Notification sent to user:', userId, notification);
  } catch (error) {
    console.error('Error sending user notification:', error);
  }
}