import { NextRequest, NextResponse } from 'next/server';
import { translationService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const voiceFile = formData.get('voiceAudio') as File;
    const language = formData.get('voiceLanguage') as string;
    const location = formData.get('location') ? JSON.parse(formData.get('location') as string) : {};
    
    if (!voiceFile || !language) {
      return NextResponse.json(
        { error: 'Voice audio and language are required' },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(await voiceFile.arrayBuffer());
    
    // Step 1: Transcribe audio
    const transcription = await translationService.transcribeAudio(audioBuffer, language);
    
    // Step 2: Categorize product
    const categorization = await translationService.categorizeProduct(
      transcription.text,
      language
    );
    
    // Step 3: Suggest pricing
    const pricing = await translationService.suggestPrice(
      transcription.text,
      categorization.category,
      location.state || 'Tamil Nadu',
      100
    );

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      confidence: transcription.confidence,
      categorization,
      pricing
    });
  } catch (error) {
    console.error('Voice analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze voice description' },
      { status: 500 }
    );
  }
}