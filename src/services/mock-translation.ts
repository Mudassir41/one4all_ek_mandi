// Mock translation service for development without AWS
import { ProductCategorizationResult, PriceSuggestion } from './translation';

export class MockTranslationService {
  async transcribeAudio(audioBlob: Buffer, language: string): Promise<{ text: string; confidence: number }> {
    // Mock transcription based on language
    const mockTranscriptions: Record<string, string> = {
      'hi': 'मेरे पास ताजे टमाटर हैं, बहुत अच्छी गुणवत्ता के',
      'ta': 'என்னிடம் புதிய தக்காளி உள்ளது, மிகவும் நல்ல தரம்',
      'te': 'నా దగ్గర తాజా టమాటాలు ఉన్నాయి, చాలా మంచి నాణ్యత',
      'en': 'I have fresh tomatoes, very good quality',
      'kn': 'ನನ್ನ ಬಳಿ ತಾಜಾ ಟೊಮೇಟೊಗಳಿವೆ, ಬಹಳ ಒಳ್ಳೆಯ ಗುಣಮಟ್ಟ'
    };

    return {
      text: mockTranscriptions[language] || mockTranscriptions['en'],
      confidence: 0.95
    };
  }

  async translateText(text: string, sourceLang: string, targetLang: string): Promise<{ translatedText: string; confidence: number }> {
    // Simple mock translation
    const translations: Record<string, Record<string, string>> = {
      'hi': {
        'en': 'I have fresh tomatoes, very good quality',
        'ta': 'என்னிடம் புதிய தக்காளி உள்ளது, மிகவும் நல்ல தரம்'
      },
      'en': {
        'hi': 'मेरे पास ताजे टमाटर हैं, बहुत अच्छी गुणवत्ता के',
        'ta': 'என்னிடம் புதிய தக்காளி உள்ளது, மிகவும் நல்ல தரம்'
      }
    };

    const translated = translations[sourceLang]?.[targetLang] || text;
    return { translatedText: translated, confidence: 0.9 };
  }
  async synthesizeSpeech(text: string, language: string): Promise<string> {
    // Return a mock audio URL
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
  }

  async categorizeProduct(description: string, language: string = 'en'): Promise<ProductCategorizationResult> {
    // Mock AI categorization
    const categories = ['agriculture', 'sericulture', 'fisheries', 'handicrafts'];
    const subcategories = {
      agriculture: ['vegetables', 'fruits', 'grains', 'spices'],
      sericulture: ['silk', 'cocoons', 'yarn'],
      fisheries: ['fresh_fish', 'dried_fish', 'seafood'],
      handicrafts: ['textiles', 'pottery', 'jewelry']
    };

    // Simple keyword-based categorization
    const lowerDesc = description.toLowerCase();
    let category = 'agriculture';
    let subcategory = 'vegetables';

    if (lowerDesc.includes('tomato') || lowerDesc.includes('टमाटर') || lowerDesc.includes('தக்காளி')) {
      category = 'agriculture';
      subcategory = 'vegetables';
    } else if (lowerDesc.includes('rice') || lowerDesc.includes('चावल')) {
      category = 'agriculture';
      subcategory = 'grains';
    }

    return {
      category,
      subcategory,
      confidence: 0.85,
      suggestedTags: ['fresh', 'organic', 'local'],
      description: description
    };
  }

  async suggestPrice(productName: string, category: string, location: string, quantity: number): Promise<PriceSuggestion> {
    // Mock price suggestions based on product type
    const basePrices: Record<string, { wholesale: number; retail: number }> = {
      'tomato': { wholesale: 35, retail: 45 },
      'onion': { wholesale: 25, retail: 35 },
      'potato': { wholesale: 20, retail: 30 },
      'rice': { wholesale: 40, retail: 50 }
    };

    const productKey = productName.toLowerCase().includes('tomato') ? 'tomato' : 'tomato';
    const prices = basePrices[productKey] || basePrices['tomato'];

    return {
      wholesalePrice: {
        min: prices.wholesale - 5,
        max: prices.wholesale + 10,
        suggested: prices.wholesale
      },
      retailPrice: {
        min: prices.retail - 5,
        max: prices.retail + 10,
        suggested: prices.retail
      },
      marketTrend: 'stable',
      confidence: 0.8,
      sources: ['Mock Market Data', 'Historical Trends']
    };
  }
}

export const mockTranslationService = new MockTranslationService();