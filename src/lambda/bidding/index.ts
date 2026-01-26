import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const BIDS_TABLE = process.env.BIDS_TABLE!;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const USER_SESSIONS_TABLE = process.env.USER_SESSIONS_TABLE!;
const VOICE_BUCKET = process.env.VOICE_BUCKET!;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface PlaceBidRequest {
  productId: string;
  amount: number;
  quantity: number;
  buyerType: 'B2B' | 'B2C';
  message?: string;
  voiceMessage?: string; // Base64 encoded audio
  deliveryLocation?: {
    state: string;
    district: string;
    address?: string;
  };
}

interface UpdateBidStatusRequest {
  bidId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  vendorMessage?: string;
  counterOffer?: {
    amount: number;
    quantity: number;
    message?: string;
  };
}

interface GetBidsRequest {
  productId?: string;
  buyerId?: string;
  vendorId?: string;
  status?: string;
  limit?: number;
  lastEvaluatedKey?: any;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Bidding event:', JSON.stringify(event, null, 2));

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
      case method === 'POST' && path.includes('/bids') && !path.includes('/'):
        return await handlePlaceBid(body as PlaceBidRequest, user, headers);
      
      case method === 'PUT' && path.includes('/bids/'):
        const bidId = extractBidIdFromPath(path);
        return await handleUpdateBidStatus({ ...body, bidId }, user, headers);
      
      case method === 'GET' && path.includes('/bids/'):
        const getBidId = extractBidIdFromPath(path);
        return await handleGetBid(getBidId, user, headers);
      
      case method === 'GET' && path.includes('/bids'):
        return await handleGetBids(queryParams as any, user, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Bidding error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Bidding service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handlePlaceBid(request: PlaceBidRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  const { productId, amount, quantity, buyerType, message, voiceMessage, deliveryLocation } = request;

  try {
    // Verify product exists and is active
    const product = await docClient.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
    }));

    if (!product.Item || product.Item.status !== 'active') {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Product not found or not available' }),
      };
    }

    // Validate buyer type and pricing
    if (buyerType === 'B2B' && !product.Item.pricing?.wholesale) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Wholesale pricing not available for this product' }),
      };
    }

    if (buyerType === 'B2C' && !product.Item.pricing?.retail) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Retail pricing not available for this product' }),
      };
    }

    // Validate minimum quantity for B2B
    if (buyerType === 'B2B' && product.Item.pricing?.wholesale?.min_quantity) {
      if (quantity < product.Item.pricing.wholesale.min_quantity) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: `Minimum quantity for wholesale is ${product.Item.pricing.wholesale.min_quantity}` 
          }),
        };
      }
    }

    // Check available quantity
    if (quantity > product.Item.quantity_available) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: `Only ${product.Item.quantity_available} ${product.Item.unit} available` 
        }),
      };
    }

    const bidId = uuidv4();
    let voiceMessageUrl = null;

    // Upload voice message if provided
    if (voiceMessage) {
      const voiceKey = `bids/${bidId}/voice-message.mp3`;
      const voiceBuffer = Buffer.from(voiceMessage, 'base64');
      
      await s3Client.send(new PutObjectCommand({
        Bucket: VOICE_BUCKET,
        Key: voiceKey,
        Body: voiceBuffer,
        ContentType: 'audio/mpeg',
      }));

      voiceMessageUrl = `s3://${VOICE_BUCKET}/${voiceKey}`;
    }

    // Calculate total amount
    const totalAmount = amount * quantity;

    const bid = {
      PK: `PRODUCT#${productId}`,
      SK: `BID#${bidId}`,
      bid_id: bidId,
      product_id: productId,
      buyer_id: user.userId,
      vendor_id: product.Item.vendor_id,
      buyer_type: buyerType,
      amount,
      quantity,
      total_amount: totalAmount,
      unit: product.Item.unit,
      message,
      voice_message: voiceMessageUrl,
      delivery_location: deliveryLocation,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    await docClient.send(new PutCommand({
      TableName: BIDS_TABLE,
      Item: bid,
    }));

    // Send real-time notification to vendor (would integrate with WebSocket API)
    await notifyVendor(product.Item.vendor_id, {
      type: 'new_bid',
      bidId,
      productId,
      buyerType,
      amount,
      quantity,
      totalAmount,
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        bid: {
          ...bid,
          voice_message: voiceMessageUrl ? 'Available' : null,
        },
        message: 'Bid placed successfully',
      }),
    };
  } catch (error) {
    console.error('Place bid error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to place bid',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleUpdateBidStatus(request: UpdateBidStatusRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  const { bidId, status, vendorMessage, counterOffer } = request;

  try {
    // Get the existing bid
    const bidResponse = await docClient.send(new QueryCommand({
      TableName: BIDS_TABLE,
      IndexName: 'BidIdIndex', // Would need to add this GSI
      KeyConditionExpression: 'bid_id = :bidId',
      ExpressionAttributeValues: {
        ':bidId': bidId,
      },
    }));

    if (!bidResponse.Items || bidResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Bid not found' }),
      };
    }

    const bid = bidResponse.Items[0];

    // Verify authorization
    if (user.userType === 'vendor' && bid.vendor_id !== user.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to update this bid' }),
      };
    }

    if (user.userType !== 'vendor' && bid.buyer_id !== user.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to update this bid' }),
      };
    }

    // Build update expression
    const updateExpressions: string[] = ['#status = :status', 'updated_at = :updated_at'];
    const expressionAttributeNames: { [key: string]: string } = { '#status': 'status' };
    const expressionAttributeValues: { [key: string]: any } = {
      ':status': status,
      ':updated_at': new Date().toISOString(),
    };

    if (vendorMessage) {
      updateExpressions.push('vendor_message = :vendorMessage');
      expressionAttributeValues[':vendorMessage'] = vendorMessage;
    }

    if (counterOffer) {
      updateExpressions.push('counter_offer = :counterOffer');
      expressionAttributeValues[':counterOffer'] = counterOffer;
    }

    await docClient.send(new UpdateCommand({
      TableName: BIDS_TABLE,
      Key: {
        PK: bid.PK,
        SK: bid.SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    // If bid is accepted, update product quantity
    if (status === 'accepted') {
      await updateProductQuantity(bid.product_id, bid.quantity);
    }

    // Send notification to buyer
    await notifyBuyer(bid.buyer_id, {
      type: 'bid_status_update',
      bidId,
      status,
      vendorMessage,
      counterOffer,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Bid status updated successfully',
        status,
      }),
    };
  } catch (error) {
    console.error('Update bid status error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to update bid status',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleGetBid(bidId: string, user: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const bidResponse = await docClient.send(new QueryCommand({
      TableName: BIDS_TABLE,
      IndexName: 'BidIdIndex', // Would need to add this GSI
      KeyConditionExpression: 'bid_id = :bidId',
      ExpressionAttributeValues: {
        ':bidId': bidId,
      },
    }));

    if (!bidResponse.Items || bidResponse.Items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Bid not found' }),
      };
    }

    const bid = bidResponse.Items[0];

    // Verify authorization
    if (bid.buyer_id !== user.userId && bid.vendor_id !== user.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to view this bid' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        bid,
      }),
    };
  } catch (error) {
    console.error('Get bid error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get bid',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleGetBids(request: GetBidsRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { productId, buyerId, vendorId, status, limit = 20, lastEvaluatedKey } = request;

    let queryParams: any = {
      TableName: BIDS_TABLE,
      Limit: parseInt(limit.toString()),
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    };

    if (productId) {
      // Get bids for a specific product
      queryParams.KeyConditionExpression = 'PK = :pk';
      queryParams.ExpressionAttributeValues = { ':pk': `PRODUCT#${productId}` };
      
      if (status) {
        queryParams.FilterExpression = '#status = :status';
        queryParams.ExpressionAttributeNames = { '#status': 'status' };
        queryParams.ExpressionAttributeValues[':status'] = status;
      }
    } else if (buyerId) {
      // Get bids by buyer
      queryParams.IndexName = 'BuyerIndex';
      queryParams.KeyConditionExpression = 'buyer_id = :buyerId';
      queryParams.ExpressionAttributeValues = { ':buyerId': buyerId };
    } else if (vendorId) {
      // Get bids for vendor's products
      queryParams.IndexName = 'VendorBidsIndex';
      queryParams.KeyConditionExpression = 'vendor_id = :vendorId';
      queryParams.ExpressionAttributeValues = { ':vendorId': vendorId };
    } else {
      // Default: get user's bids based on their role
      if (user.userType === 'vendor') {
        queryParams.IndexName = 'VendorBidsIndex';
        queryParams.KeyConditionExpression = 'vendor_id = :vendorId';
        queryParams.ExpressionAttributeValues = { ':vendorId': user.userId };
      } else {
        queryParams.IndexName = 'BuyerIndex';
        queryParams.KeyConditionExpression = 'buyer_id = :buyerId';
        queryParams.ExpressionAttributeValues = { ':buyerId': user.userId };
      }
    }

    const response = await docClient.send(new QueryCommand(queryParams));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        bids: response.Items || [],
        count: (response.Items || []).length,
        lastEvaluatedKey: response.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error('Get bids error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get bids',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
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

function extractBidIdFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

async function updateProductQuantity(productId: string, soldQuantity: number): Promise<void> {
  try {
    await docClient.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
      UpdateExpression: 'SET quantity_available = quantity_available - :soldQuantity, updated_at = :updated_at',
      ExpressionAttributeValues: {
        ':soldQuantity': soldQuantity,
        ':updated_at': new Date().toISOString(),
      },
      ConditionExpression: 'quantity_available >= :soldQuantity',
    }));
  } catch (error) {
    console.error('Error updating product quantity:', error);
    throw new Error('Failed to update product quantity');
  }
}

async function notifyVendor(vendorId: string, notification: any): Promise<void> {
  try {
    // Store notification for real-time delivery
    await docClient.send(new PutCommand({
      TableName: USER_SESSIONS_TABLE,
      Item: {
        PK: `NOTIFICATION#${vendorId}`,
        SK: `NOTIF#${Date.now()}`,
        user_id: vendorId,
        notification,
        created_at: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours TTL
      },
    }));

    // In a real implementation, this would also send via WebSocket
    console.log('Notification sent to vendor:', vendorId, notification);
  } catch (error) {
    console.error('Error sending vendor notification:', error);
  }
}

async function notifyBuyer(buyerId: string, notification: any): Promise<void> {
  try {
    // Store notification for real-time delivery
    await docClient.send(new PutCommand({
      TableName: USER_SESSIONS_TABLE,
      Item: {
        PK: `NOTIFICATION#${buyerId}`,
        SK: `NOTIF#${Date.now()}`,
        user_id: buyerId,
        notification,
        created_at: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours TTL
      },
    }));

    // In a real implementation, this would also send via WebSocket
    console.log('Notification sent to buyer:', buyerId, notification);
  } catch (error) {
    console.error('Error sending buyer notification:', error);
  }
}