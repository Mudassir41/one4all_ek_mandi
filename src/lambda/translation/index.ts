import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});
const transcribeClient = new TranscribeClient({});
const translateClient = new TranslateClient({});
const pollyClient = new PollyClient({});
const bedrockClient = new BedrockRuntimeClient({});

const VOICE_BUCKET = process.env.VOICE_BUCKET!;
const TRANSLATION_CACHE_TABLE = process.env.TRANSLATION_CACHE_TABLE!;

interface VoiceTranslationRequest {
  audioData: string; // Base64 encoded audio
  sourceLang: string;
  targetLang: string;
  context?: 'trade' | 'casual' | 'formal';
}

interface TextTranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  context?: 'trade' | 'casual' | 'formal';
}

interface BatchTranslationRequest {
  items: string[];
  sourceLang: string;
  targetLang: string;
}

// Language code mappings for different AWS services
const LANGUAGE_MAPPINGS = {
  transcribe: {
    'hindi': 'hi-IN',
    'tamil': 'ta-IN',
    'telugu': 'te-IN',
    'kannada': 'kn-IN',
    'bengali': 'bn-IN',
    'odia': 'or-IN',
    'malayalam': 'ml-IN',
    'english': 'en-IN',
  },
  translate: {
    'hindi': 'hi',
    'tamil': 'ta',
    'telugu': 'te',
    'kannada': 'kn',
    'bengali': 'bn',
    'odia': 'or',
    'malayalam': 'ml',
    'english': 'en',
  },
  polly: {
    'hindi': 'Aditi',
    'tamil': 'Aditi', // Fallback to Hindi voice
    'telugu': 'Aditi', // Fallback to Hindi voice
    'kannada': 'Aditi', // Fallback to Hindi voice
    'bengali': 'Aditi', // Fallback to Hindi voice
    'odia': 'Aditi', // Fallback to Hindi voice
    'malayalam': 'Aditi', // Fallback to Hindi voice
    'english': 'Raveena',
  },
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Translation event:', JSON.stringify(event, null, 2));

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

    const body = event.body ? JSON.parse(event.body) : {};

    switch (true) {
      case path.includes('/voice'):
        return await handleVoiceTranslation(body as VoiceTranslationRequest, headers);
      
      case path.includes('/text'):
        return await handleTextTranslation(body as TextTranslationRequest, headers);
      
      case path.includes('/batch'):
        return await handleBatchTranslation(body as BatchTranslationRequest, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Translation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Translation service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handleVoiceTranslation(request: VoiceTranslationRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { audioData, sourceLang, targetLang, context = 'trade' } = request;

  try {
    // Generate unique job ID
    const jobId = uuidv4();
    const audioKey = `voice-input/${jobId}.mp3`;

    // Upload audio to S3
    const audioBuffer = Buffer.from(audioData, 'base64');
    await s3Client.send(new PutObjectCommand({
      Bucket: VOICE_BUCKET,
      Key: audioKey,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
    }));

    // Start transcription job
    const transcribeJobName = `transcribe-${jobId}`;
    const sourceLanguageCode = LANGUAGE_MAPPINGS.transcribe[sourceLang as keyof typeof LANGUAGE_MAPPINGS.transcribe];
    
    if (!sourceLanguageCode) {
      throw new Error(`Unsupported source language: ${sourceLang}`);
    }

    await transcribeClient.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: transcribeJobName,
      LanguageCode: sourceLanguageCode,
      Media: {
        MediaFileUri: `s3://${VOICE_BUCKET}/${audioKey}`,
      },
      OutputBucketName: VOICE_BUCKET,
      OutputKey: `transcriptions/${jobId}.json`,
    }));

    // Poll for transcription completion
    let transcriptionResult = null;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (attempts < maxAttempts) {
      const jobStatus = await transcribeClient.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: transcribeJobName,
      }));

      if (jobStatus.TranscriptionJob?.TranscriptionJobStatus === 'COMPLETED') {
        // Get transcription result from S3
        const transcriptionUri = jobStatus.TranscriptionJob.Transcript?.TranscriptFileUri;
        if (transcriptionUri) {
          const transcriptionKey = transcriptionUri.split('/').slice(-2).join('/');
          const transcriptionObject = await s3Client.send(new GetObjectCommand({
            Bucket: VOICE_BUCKET,
            Key: transcriptionKey,
          }));
          
          const transcriptionText = await transcriptionObject.Body?.transformToString();
          if (transcriptionText) {
            const transcriptionData = JSON.parse(transcriptionText);
            transcriptionResult = transcriptionData.results.transcripts[0].transcript;
          }
        }
        break;
      } else if (jobStatus.TranscriptionJob?.TranscriptionJobStatus === 'FAILED') {
        throw new Error('Transcription job failed');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!transcriptionResult) {
      throw new Error('Transcription timeout or failed');
    }

    // Translate the transcribed text
    const translatedText = await translateTextWithContext(transcriptionResult, sourceLang, targetLang, context);

    // Generate speech from translated text
    const translatedAudioKey = `voice-output/${jobId}-translated.mp3`;
    const targetVoice = LANGUAGE_MAPPINGS.polly[targetLang as keyof typeof LANGUAGE_MAPPINGS.polly];
    
    const speechResponse = await pollyClient.send(new SynthesizeSpeechCommand({
      Text: translatedText,
      OutputFormat: 'mp3',
      VoiceId: targetVoice,
      Engine: 'neural',
    }));

    if (speechResponse.AudioStream) {
      const audioBuffer = await streamToBuffer(speechResponse.AudioStream);
      await s3Client.send(new PutObjectCommand({
        Bucket: VOICE_BUCKET,
        Key: translatedAudioKey,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
      }));

      // Return the translated audio as base64
      const translatedAudioBase64 = audioBuffer.toString('base64');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          sourceTranscript: transcriptionResult,
          targetTranscript: translatedText,
          translatedAudio: translatedAudioBase64,
          confidence: 0.95, // Placeholder - would be calculated from actual services
          jobId,
        }),
      };
    }

    throw new Error('Failed to generate speech');
  } catch (error) {
    console.error('Voice translation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Voice translation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleTextTranslation(request: TextTranslationRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { text, sourceLang, targetLang, context = 'trade' } = request;

  try {
    const translatedText = await translateTextWithContext(text, sourceLang, targetLang, context);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        originalText: text,
        translatedText,
        sourceLang,
        targetLang,
        context,
      }),
    };
  } catch (error) {
    console.error('Text translation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Text translation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleBatchTranslation(request: BatchTranslationRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { items, sourceLang, targetLang } = request;

  try {
    const translations = await Promise.all(
      items.map(item => translateTextWithContext(item, sourceLang, targetLang, 'trade'))
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        translations: items.map((original, index) => ({
          original,
          translated: translations[index],
        })),
        sourceLang,
        targetLang,
      }),
    };
  } catch (error) {
    console.error('Batch translation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Batch translation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function translateTextWithContext(text: string, sourceLang: string, targetLang: string, context: string): Promise<string> {
  // Check cache first
  const cacheKey = generateCacheKey(text, sourceLang, targetLang, context);
  const cachedTranslation = await getCachedTranslation(cacheKey);
  
  if (cachedTranslation) {
    return cachedTranslation;
  }

  // Use Bedrock (Claude) for context-aware translation
  const prompt = createTranslationPrompt(text, sourceLang, targetLang, context);
  
  try {
    const response = await bedrockClient.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const translatedText = responseBody.content[0].text.trim();

    // Cache the translation
    await cacheTranslation(cacheKey, translatedText);

    return translatedText;
  } catch (error) {
    console.error('Bedrock translation failed, falling back to AWS Translate:', error);
    
    // Fallback to AWS Translate
    const sourceCode = LANGUAGE_MAPPINGS.translate[sourceLang as keyof typeof LANGUAGE_MAPPINGS.translate];
    const targetCode = LANGUAGE_MAPPINGS.translate[targetLang as keyof typeof LANGUAGE_MAPPINGS.translate];
    
    const response = await translateClient.send(new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceCode,
      TargetLanguageCode: targetCode,
    }));

    const translatedText = response.TranslatedText || text;
    await cacheTranslation(cacheKey, translatedText);
    
    return translatedText;
  }
}

function createTranslationPrompt(text: string, sourceLang: string, targetLang: string, context: string): string {
  const contextInstructions = {
    trade: 'This is a trade/commerce conversation. Use appropriate business terminology and maintain professional tone.',
    casual: 'This is a casual conversation. Use natural, everyday language.',
    formal: 'This is a formal conversation. Use respectful and polite language.',
  };

  return `You are a professional translator specializing in Indian languages and trade terminology. 

Context: ${contextInstructions[context as keyof typeof contextInstructions]}

Please translate the following text from ${sourceLang} to ${targetLang}:

"${text}"

Requirements:
1. Maintain the original meaning and tone
2. Use culturally appropriate expressions
3. For trade terms, use commonly understood terminology
4. Keep the translation natural and fluent
5. Only return the translated text, no explanations

Translation:`;
}

function generateCacheKey(text: string, sourceLang: string, targetLang: string, context: string): string {
  const content = `${text}|${sourceLang}|${targetLang}|${context}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

async function getCachedTranslation(cacheKey: string): Promise<string | null> {
  try {
    const response = await docClient.send(new GetCommand({
      TableName: TRANSLATION_CACHE_TABLE,
      Key: {
        PK: `TRANSLATION#${cacheKey}`,
        SK: 'CACHED',
      },
    }));

    if (response.Item && response.Item.ttl > Math.floor(Date.now() / 1000)) {
      return response.Item.translated_text;
    }
  } catch (error) {
    console.error('Cache lookup error:', error);
  }
  
  return null;
}

async function cacheTranslation(cacheKey: string, translatedText: string): Promise<void> {
  try {
    const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

    await docClient.send(new PutCommand({
      TableName: TRANSLATION_CACHE_TABLE,
      Item: {
        PK: `TRANSLATION#${cacheKey}`,
        SK: 'CACHED',
        translated_text: translatedText,
        ttl,
        created_at: new Date().toISOString(),
      },
    }));
  } catch (error) {
    console.error('Cache storage error:', error);
  }
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}