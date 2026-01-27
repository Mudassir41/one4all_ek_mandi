// Mock translation service for development without AWS
import { ProductCategorizationResult, PriceSuggestion } from './translation';

export class MockTranslationService {
  async transcribeAudio(audioBlob: Buffer, language: string): Promise<{ text: string; confidence: number }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock transcription based on language with more realistic responses
    const mockTranscriptions: Record<string, string[]> = {
      'hi': [
        'मेरे पास ताजे टमाटर हैं, बहुत अच्छी गुणवत्ता के। ये जैविक हैं और बिना किसी रसायन के उगाए गए हैं।',
        'मैं बासमती चावल बेच रहा हूं। यह प्रीमियम गुणवत्ता का है और सीधे खेत से आता है।',
        'हमारे पास ताजी सब्जियां हैं - प्याज, आलू, और हरी मिर्च। सभी स्थानीय रूप से उगाई गई हैं।'
      ],
      'ta': [
        'என்னிடம் புதிய தக்காளி உள்ளது, மிகவும் நல்ல தரம். இவை இயற்கையானவை மற்றும் இரசாயனங்கள் இல்லாமல் வளர்க்கப்பட்டவை.',
        'நான் பாஸ்மதி அரிசி விற்கிறேன். இது உயர்தர தரம் மற்றும் நேரடியாக வயலில் இருந்து வருகிறது.',
        'எங்களிடம் புதிய காய்கறிகள் உள்ளன - வெங்காயம், உருளைக்கிழங்கு மற்றும் பச்சை மிளகாய். அனைத்தும் உள்ளூரில் வளர்க்கப்பட்டவை.'
      ],
      'te': [
        'నా దగ్గర తాజా టమాటాలు ఉన్నాయి, చాలా మంచి నాణ్యత. ఇవి సేంద్రీయమైనవి మరియు రసాయనాలు లేకుండా పెంచబడ్డాయి.',
        'నేను బాస్మతి బియ్యం అమ్ముతున్నాను. ఇది ప్రీమియం నాణ్యత మరియు నేరుగా పొలం నుండి వస్తుంది.',
        'మా దగ్గర తాజా కూరగాయలు ఉన్నాయి - ఉల్లిపాయలు, బంగాళాదుంపలు మరియు పచ్చిమిర్చులు. అన్నీ స్థానికంగా పెంచబడ్డాయి.'
      ],
      'en': [
        'I have fresh tomatoes, very good quality. These are organic and grown without any chemicals.',
        'I am selling basmati rice. This is premium quality and comes directly from the farm.',
        'We have fresh vegetables - onions, potatoes, and green chilies. All are locally grown.'
      ],
      'kn': [
        'ನನ್ನ ಬಳಿ ತಾಜಾ ಟೊಮೇಟೊಗಳಿವೆ, ಬಹಳ ಒಳ್ಳೆಯ ಗುಣಮಟ್ಟ. ಇವು ಸಾವಯವ ಮತ್ತು ಯಾವುದೇ ರಾಸಾಯನಿಕಗಳಿಲ್ಲದೆ ಬೆಳೆಸಲಾಗಿದೆ.',
        'ನಾನು ಬಾಸ್ಮತಿ ಅಕ್ಕಿ ಮಾರಾಟ ಮಾಡುತ್ತಿದ್ದೇನೆ. ಇದು ಪ್ರೀಮಿಯಂ ಗುಣಮಟ್ಟ ಮತ್ತು ನೇರವಾಗಿ ಹೊಲದಿಂದ ಬರುತ್ತದೆ.',
        'ನಮ್ಮ ಬಳಿ ತಾಜಾ ತರಕಾರಿಗಳಿವೆ - ಈರುಳ್ಳಿ, ಆಲೂಗಡ್ಡೆ ಮತ್ತು ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ. ಎಲ್ಲವೂ ಸ್ಥಳೀಯವಾಗಿ ಬೆಳೆಸಲಾಗಿದೆ.'
      ]
    };

    const transcriptions = mockTranscriptions[language] || mockTranscriptions['en'];
    const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
    
    return {
      text: randomTranscription,
      confidence: 0.92 + Math.random() * 0.07 // Random confidence between 0.92-0.99
    };
  }

  async translateText(text: string, sourceLang: string, targetLang: string): Promise<{ translatedText: string; confidence: number }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enhanced translation mapping
    const translations: Record<string, Record<string, string>> = {
      'hi': {
        'en': 'I have fresh tomatoes, very good quality. These are organic and grown without any chemicals.',
        'ta': 'என்னிடம் புதிய தக்காளி உள்ளது, மிகவும் நல்ல தரம். இவை இயற்கையானவை மற்றும் இரசாயனங்கள் இல்லாமல் வளர்க்கப்பட்டவை.',
        'te': 'నా దగ్గర తాజా టమాటాలు ఉన్నాయి, చాలా మంచి నాణ్యత. ఇవి సేంద్రీయమైనవి మరియు రసాయనాలు లేకుండా పెంచబడ్డాయి.'
      },
      'en': {
        'hi': 'मेरे पास ताजे टमाटर हैं, बहुत अच्छी गुणवत्ता के। ये जैविक हैं और बिना किसी रसायन के उगाए गए हैं।',
        'ta': 'என்னிடம் புதிய தக்காளி உள்ளது, மிகவும் நல்ல தரம். இவை இயற்கையானவை மற்றும் இரசாயனங்கள் இல்லாமல் வளர்க்கப்பட்டவை.',
        'te': 'నా దగ్గర తాజా టమాటాలు ఉన్నాయి, చాలా మంచి నాణ్యత. ఇవి సేంద్రీయమైనవి మరియు రసాయనాలు లేకుండా పెంచబడ్డాయి.'
      },
      'ta': {
        'en': 'I have fresh tomatoes, very good quality. These are organic and grown without any chemicals.',
        'hi': 'मेरे पास ताजे टमाटर हैं, बहुत अच्छी गुणवत्ता के। ये जैविक हैं और बिना किसी रसायन के उगाए गए हैं।',
        'te': 'నా దగ్గర తాజా టమాటాలు ఉన్నాయి, చాలా మంచి నాణ్యత. ఇవి సేంద్రీయమైనవి మరియు రసాయనాలు లేకుండా పెంచబడ్డాయి.'
      }
    };

    const translated = translations[sourceLang]?.[targetLang] || text;
    return { 
      translatedText: translated, 
      confidence: 0.88 + Math.random() * 0.1 // Random confidence between 0.88-0.98
    };
  }

  async synthesizeSpeech(text: string, language: string): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return a mock audio URL - in real implementation this would be actual audio
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
  }

  async categorizeProduct(description: string, language: string = 'en'): Promise<ProductCategorizationResult> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Enhanced AI categorization with better keyword detection
    const lowerDesc = description.toLowerCase();
    let category = 'agriculture';
    let subcategory = 'vegetables';
    let suggestedTags: string[] = ['fresh', 'local'];

    // Better categorization logic
    if (lowerDesc.includes('tomato') || lowerDesc.includes('टमाटर') || lowerDesc.includes('தக்காளி') || lowerDesc.includes('టమాటా')) {
      category = 'agriculture';
      subcategory = 'vegetables';
      suggestedTags = ['fresh', 'organic', 'red', 'juicy'];
    } else if (lowerDesc.includes('rice') || lowerDesc.includes('चावल') || lowerDesc.includes('அரிசி') || lowerDesc.includes('బియ్యం')) {
      category = 'agriculture';
      subcategory = 'grains';
      suggestedTags = ['premium', 'basmati', 'aromatic', 'long-grain'];
    } else if (lowerDesc.includes('onion') || lowerDesc.includes('प्याज') || lowerDesc.includes('வெங்காயம்') || lowerDesc.includes('ఉల్లిపాయ')) {
      category = 'agriculture';
      subcategory = 'vegetables';
      suggestedTags = ['fresh', 'pungent', 'storage', 'cooking'];
    } else if (lowerDesc.includes('potato') || lowerDesc.includes('आलू') || lowerDesc.includes('உருளைக்கிழங்கு') || lowerDesc.includes('బంగాళాదుంప')) {
      category = 'agriculture';
      subcategory = 'vegetables';
      suggestedTags = ['fresh', 'starchy', 'versatile', 'cooking'];
    } else if (lowerDesc.includes('organic') || lowerDesc.includes('जैविक') || lowerDesc.includes('இயற்கை') || lowerDesc.includes('సేంద్రీయ')) {
      suggestedTags.push('organic', 'chemical-free', 'natural');
    }

    // Add quality indicators
    if (lowerDesc.includes('premium') || lowerDesc.includes('quality') || lowerDesc.includes('गुणवत्ता') || lowerDesc.includes('தரம்') || lowerDesc.includes('నాణ్యత')) {
      suggestedTags.push('premium', 'high-quality');
    }

    return {
      category,
      subcategory,
      confidence: 0.89 + Math.random() * 0.1, // Random confidence between 0.89-0.99
      suggestedTags,
      description: description
    };
  }

  async suggestPrice(productName: string, category: string, location: string, quantity: number): Promise<PriceSuggestion> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Enhanced price suggestions with location and quantity factors
    const basePrices: Record<string, { wholesale: number; retail: number }> = {
      'tomato': { wholesale: 35, retail: 45 },
      'onion': { wholesale: 25, retail: 35 },
      'potato': { wholesale: 20, retail: 30 },
      'rice': { wholesale: 40, retail: 50 },
      'basmati': { wholesale: 60, retail: 75 },
      'vegetables': { wholesale: 30, retail: 40 },
      'grains': { wholesale: 45, retail: 55 }
    };

    // Determine product key from name and category
    let productKey = 'vegetables';
    const lowerName = productName.toLowerCase();
    
    if (lowerName.includes('tomato') || lowerName.includes('टमाटर')) productKey = 'tomato';
    else if (lowerName.includes('onion') || lowerName.includes('प्याज')) productKey = 'onion';
    else if (lowerName.includes('potato') || lowerName.includes('आलू')) productKey = 'potato';
    else if (lowerName.includes('rice') || lowerName.includes('चावल')) productKey = 'rice';
    else if (lowerName.includes('basmati')) productKey = 'basmati';
    else if (category === 'grains') productKey = 'grains';

    const prices = basePrices[productKey] || basePrices['vegetables'];

    // Location-based price adjustment
    const locationMultiplier = location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('delhi') ? 1.15 : 1.0;
    
    // Quantity-based adjustment (bulk discount)
    const quantityMultiplier = quantity > 100 ? 0.95 : quantity > 500 ? 0.9 : 1.0;

    const adjustedWholesale = Math.round(prices.wholesale * locationMultiplier * quantityMultiplier);
    const adjustedRetail = Math.round(prices.retail * locationMultiplier);

    return {
      wholesalePrice: {
        min: adjustedWholesale - 8,
        max: adjustedWholesale + 12,
        suggested: adjustedWholesale
      },
      retailPrice: {
        min: adjustedRetail - 6,
        max: adjustedRetail + 15,
        suggested: adjustedRetail
      },
      marketTrend: Math.random() > 0.5 ? 'up' : 'stable',
      confidence: 0.82 + Math.random() * 0.15, // Random confidence between 0.82-0.97
      sources: ['Mock Market Data', 'Historical Trends', 'Regional Price Analysis', 'Seasonal Factors']
    };
  }
}

export const mockTranslationService = new MockTranslationService();