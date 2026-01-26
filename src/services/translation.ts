import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const translateClient = new TranslateClient({ region: process.env.AWS_REGION || 'us-east-1' });
const pollyClient = new PollyClient({ region: process.env.AWS_REGION || 'us-east-1' });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export interface VoiceTranslationResult {
  originalText: string;
  translatedText: string;
  originalAudio: string; // S3 URL
  translatedAudio: string; // S3 URL
  confidence: number;
  sourceLang: string;
  targetLang: string;
}

export interface ProductCategorizationResult {
  category: string;
  subcategory: string;
  confidence: number;
  suggestedTags: string[];
  description: string;
}

export interface PriceSuggestion {
  wholesalePrice: {
    min: number;
    max: number;
    suggested: number;
  };
  retailPrice: {
    min: number;
    max: number;
    suggested: number;
  };
  marketTrend: 'up' | 'down' | 'stable';
  confidence: number;
  sources: string[];
}

export class TranslationService {
  private readonly BUCKET_NAME = process.env.S3_BUCKET_VOICE || 'ek-bharath-ek-mandi-voice';
  private readonly SUPPORTED_LANGUAGES = [
    'hi', 'en', 'ta', 'te', 'kn', 'ml', 'bn', 'or', 'gu', 'mr', 'pa'
  ];

  /**
   * Transcribe audio to text using AWS Transcribe
   */
  async transcribeAudio(audioBlob: Buffer, language: string): Promise<{ text: string; confidence: number }> {
    try {
      const jobName = `transcribe-${uuidv4()}`;
      const audioKey = `audio/input/${jobName}.wav`;

      // Upload audio to S3
      await s3Client.send(new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: audioKey,
        Body: audioBlob,
        ContentType: 'audio/wav'
      }));

      // Start transcription job
      const transcribeParams = {
        TranscriptionJobName: jobName,
        LanguageCode: this.mapLanguageToTranscribeCode(language),
        MediaFormat: 'wav',
        Media: {
          MediaFileUri: `s3://${this.BUCKET_NAME}/${audioKey}`
        },
        OutputBucketName: this.BUCKET_NAME,
        OutputKey: `transcripts/${jobName}.json`,
        Settings: {
          ShowSpeakerLabels: false,
          MaxSpeakerLabels: 1
        }
      };

      await transcribeClient.send(new StartTranscriptionJobCommand(transcribeParams));

      // Poll for completion
      let jobStatus = 'IN_PROGRESS';
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max

      while (jobStatus === 'IN_PROGRESS' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const statusResponse = await transcribeClient.send(
          new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
        );
        
        jobStatus = statusResponse.TranscriptionJob?.TranscriptionJobStatus || 'FAILED';
        attempts++;
      }

      if (jobStatus !== 'COMPLETED') {
        throw new Error(`Transcription failed with status: ${jobStatus}`);
      }

      // Get transcription result
      const transcriptResponse = await s3Client.send(new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: `transcripts/${jobName}.json`
      }));

      const transcriptData = JSON.parse(await transcriptResponse.Body?.transformToString() || '{}');
      const transcript = transcriptData.results?.transcripts?.[0]?.transcript || '';
      const confidence = transcriptData.results?.items?.[0]?.alternatives?.[0]?.confidence || 0;

      return {
        text: transcript,
        confidence: parseFloat(confidence)
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Translate text using AWS Translate
   */
  async translateText(text: string, sourceLang: string, targetLang: string): Promise<{ translatedText: string; confidence: number }> {
    try {
      const response = await translateClient.send(new TranslateTextCommand({
        Text: text,
        SourceLanguageCode: sourceLang,
        TargetLanguageCode: targetLang
      }));

      return {
        translatedText: response.TranslatedText || '',
        confidence: 0.95 // AWS Translate doesn't provide confidence scores
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }

  /**
   * Convert text to speech using AWS Polly
   */
  async synthesizeSpeech(text: string, language: string): Promise<string> {
    try {
      const voiceId = this.mapLanguageToPollyVoice(language);
      
      const response = await pollyClient.send(new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: voiceId,
        Engine: 'neural'
      }));

      if (!response.AudioStream) {
        throw new Error('No audio stream received from Polly');
      }

      // Convert stream to buffer
      const audioBuffer = Buffer.from(await response.AudioStream.transformToByteArray());
      
      // Upload to S3
      const audioKey = `audio/output/${uuidv4()}.mp3`;
      await s3Client.send(new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: audioKey,
        Body: audioBuffer,
        ContentType: 'audio/mpeg'
      }));

      // Return signed URL
      return await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: audioKey
      }), { expiresIn: 3600 }); // 1 hour expiry
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  /**
   * Complete voice translation pipeline
   */
  async translateVoice(audioBlob: Buffer, sourceLang: string, targetLang: string): Promise<VoiceTranslationResult> {
    try {
      // Step 1: Transcribe audio to text
      const transcription = await this.transcribeAudio(audioBlob, sourceLang);
      
      // Step 2: Translate text
      const translation = await this.translateText(transcription.text, sourceLang, targetLang);
      
      // Step 3: Synthesize translated text to speech
      const translatedAudioUrl = await this.synthesizeSpeech(translation.translatedText, targetLang);
      
      // Step 4: Store original audio
      const originalAudioKey = `audio/original/${uuidv4()}.wav`;
      await s3Client.send(new PutObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: originalAudioKey,
        Body: audioBlob,
        ContentType: 'audio/wav'
      }));
      
      const originalAudioUrl = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: originalAudioKey
      }), { expiresIn: 3600 });

      return {
        originalText: transcription.text,
        translatedText: translation.translatedText,
        originalAudio: originalAudioUrl,
        translatedAudio: translatedAudioUrl,
        confidence: Math.min(transcription.confidence, translation.confidence),
        sourceLang,
        targetLang
      };
    } catch (error) {
      console.error('Voice translation error:', error);
      throw new Error('Failed to translate voice message');
    }
  }

  /**
   * AI-powered product categorization using Amazon Bedrock
   */
  async categorizeProduct(description: string, language: string = 'en'): Promise<ProductCategorizationResult> {
    try {
      // Translate to English if needed
      let englishDescription = description;
      if (language !== 'en') {
        const translation = await this.translateText(description, language, 'en');
        englishDescription = translation.translatedText;
      }

      const prompt = `
You are an AI assistant specialized in categorizing agricultural and trade products for an Indian marketplace. 
Analyze the following product description and provide categorization:

Product Description: "${englishDescription}"

Please provide a JSON response with the following structure:
{
  "category": "main category (agriculture, sericulture, fisheries, handicrafts)",
  "subcategory": "specific subcategory",
  "confidence": "confidence score between 0 and 1",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "description": "cleaned and enhanced product description"
}

Categories and subcategories:
- agriculture: vegetables, fruits, grains, spices, pulses
- sericulture: silk, cocoons, mulberry, yarn
- fisheries: fresh_fish, dried_fish, seafood
- handicrafts: textiles, pottery, wood_crafts, jewelry

Focus on Indian agricultural and trade products. Be specific and accurate.
`;

      const response = await bedrockClient.send(new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      }));

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const aiResponse = responseBody.content[0].text;
      
      // Parse JSON response from AI
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        category: result.category || 'agriculture',
        subcategory: result.subcategory || 'vegetables',
        confidence: result.confidence || 0.8,
        suggestedTags: result.suggestedTags || [],
        description: result.description || englishDescription
      };
    } catch (error) {
      console.error('Product categorization error:', error);
      // Fallback categorization
      return {
        category: 'agriculture',
        subcategory: 'vegetables',
        confidence: 0.5,
        suggestedTags: ['fresh', 'local'],
        description: description
      };
    }
  }

  /**
   * AI-powered price suggestion
   */
  async suggestPrice(productName: string, category: string, location: string, quantity: number): Promise<PriceSuggestion> {
    try {
      const prompt = `
You are an AI assistant specialized in Indian agricultural market pricing. 
Provide price suggestions for the following product:

Product: ${productName}
Category: ${category}
Location: ${location}
Quantity: ${quantity} kg

Please provide a JSON response with current market price suggestions:
{
  "wholesalePrice": {
    "min": "minimum wholesale price per kg",
    "max": "maximum wholesale price per kg", 
    "suggested": "suggested wholesale price per kg"
  },
  "retailPrice": {
    "min": "minimum retail price per kg",
    "max": "maximum retail price per kg",
    "suggested": "suggested retail price per kg"
  },
  "marketTrend": "up/down/stable",
  "confidence": "confidence score between 0 and 1",
  "sources": ["source1", "source2"]
}

Base your suggestions on typical Indian market prices, seasonal variations, and regional differences.
Wholesale prices should be 20-30% lower than retail prices.
`;

      const response = await bedrockClient.send(new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      }));

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const aiResponse = responseBody.content[0].text;
      
      // Parse JSON response from AI
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid AI response format');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        wholesalePrice: {
          min: result.wholesalePrice?.min || 20,
          max: result.wholesalePrice?.max || 50,
          suggested: result.wholesalePrice?.suggested || 35
        },
        retailPrice: {
          min: result.retailPrice?.min || 30,
          max: result.retailPrice?.max || 70,
          suggested: result.retailPrice?.suggested || 45
        },
        marketTrend: result.marketTrend || 'stable',
        confidence: result.confidence || 0.7,
        sources: result.sources || ['AI Analysis', 'Market Data']
      };
    } catch (error) {
      console.error('Price suggestion error:', error);
      // Fallback pricing
      return {
        wholesalePrice: { min: 20, max: 50, suggested: 35 },
        retailPrice: { min: 30, max: 70, suggested: 45 },
        marketTrend: 'stable',
        confidence: 0.5,
        sources: ['Fallback Pricing']
      };
    }
  }

  /**
   * Map language codes to AWS Transcribe language codes
   */
  private mapLanguageToTranscribeCode(language: string): string {
    const mapping: Record<string, string> = {
      'hi': 'hi-IN',
      'en': 'en-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'mr': 'mr-IN',
      'pa': 'pa-IN',
      'or': 'en-IN' // Fallback to English for Odia
    };
    return mapping[language] || 'en-IN';
  }

  /**
   * Map language codes to AWS Polly voice IDs
   */
  private mapLanguageToPollyVoice(language: string): string {
    const mapping: Record<string, string> = {
      'hi': 'Aditi',
      'en': 'Raveena',
      'ta': 'Raveena', // Fallback to English
      'te': 'Raveena', // Fallback to English
      'kn': 'Raveena', // Fallback to English
      'ml': 'Raveena', // Fallback to English
      'bn': 'Raveena', // Fallback to English
      'gu': 'Aditi', // Use Hindi voice
      'mr': 'Aditi', // Use Hindi voice
      'pa': 'Aditi', // Use Hindi voice
      'or': 'Raveena' // Fallback to English
    };
    return mapping[language] || 'Raveena';
  }

  /**
   * Validate supported language
   */
  isLanguageSupported(language: string): boolean {
    return this.SUPPORTED_LANGUAGES.includes(language);
  }

  /**
   * Get supported languages list
   */
  getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }
}

export const translationService = new TranslationService();