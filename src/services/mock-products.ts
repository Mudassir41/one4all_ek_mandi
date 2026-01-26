// Mock product service for development without AWS
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductSearchQuery, ProductSearchResult } from './products';
import { mockTranslationService } from './mock-translation';

// In-memory storage for development
let mockProducts: Product[] = [];

export class MockProductService {
  async createProduct(productData: {
    vendorId: string;
    voiceDescription?: { audio: Buffer; language: string };
    textDescription?: string;
    images?: Buffer[];
    location: { state: string; district: string; coordinates: [number, number] };
    pricing?: any;
    inventory?: any;
    quality?: any;
  }): Promise<Product> {
    const productId = uuidv4();
    const now = new Date().toISOString();

    let title: Record<string, string> = {};
    let description: Record<string, string> = {};
    let category = 'agriculture';
    let subcategory = 'vegetables';
    let tags: string[] = [];

    // Process voice or text description
    if (productData.voiceDescription) {
      const transcription = await mockTranslationService.transcribeAudio(
        productData.voiceDescription.audio,
        productData.voiceDescription.language
      );

      const categorization = await mockTranslationService.categorizeProduct(
        transcription.text,
        productData.voiceDescription.language
      );

      category = categorization.category;
      subcategory = categorization.subcategory;
      tags = categorization.suggestedTags;

      description[productData.voiceDescription.language] = transcription.text;
      title[productData.voiceDescription.language] = transcription.text.split(' ').slice(0, 5).join(' ');

      // Mock translations
      if (productData.voiceDescription.language !== 'en') {
        const translation = await mockTranslationService.translateText(
          transcription.text,
          productData.voiceDescription.language,
          'en'
        );
        title['en'] = translation.translatedText.split(' ').slice(0, 5).join(' ');
        description['en'] = translation.translatedText;
      }
    } else if (productData.textDescription) {
      const categorization = await mockTranslationService.categorizeProduct(productData.textDescription);
      category = categorization.category;
      subcategory = categorization.subcategory;
      tags = categorization.suggestedTags;
      
      description['en'] = productData.textDescription;
      title['en'] = productData.textDescription.split(' ').slice(0, 5).join(' ');
    }

    // Mock pricing if not provided
    let pricing = productData.pricing;
    if (!pricing) {
      const priceSuggestion = await mockTranslationService.suggestPrice(
        title['en'] || 'product',
        category,
        productData.location.state,
        100
      );
      pricing = {
        wholesale: {
          minQuantity: 50,
          price: priceSuggestion.wholesalePrice.suggested,
          unit: 'kg'
        },
        retail: {
          price: priceSuggestion.retailPrice.suggested,
          unit: 'kg'
        }
      };
    }

    const product: Product = {
      id: productId,
      vendorId: productData.vendorId,
      title,
      description,
      category,
      subcategory,
      tags,
      images: ['https://via.placeholder.com/400x300?text=Product+Image'], // Mock image
      pricing,
      inventory: productData.inventory || { available: 100, unit: 'kg', lastUpdated: now },
      location: productData.location,
      quality: productData.quality || {},
      status: 'active',
      visibility: 'public',
      createdAt: now,
      updatedAt: now
    };

    mockProducts.push(product);
    return product;
  }
  async searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult> {
    let filteredProducts = [...mockProducts];

    // Text search
    if (query.text) {
      const searchTerms = query.text.toLowerCase().split(' ');
      filteredProducts = filteredProducts.filter(product => {
        const searchableText = [
          ...Object.values(product.title),
          ...Object.values(product.description),
          ...product.tags,
          product.category,
          product.subcategory
        ].join(' ').toLowerCase();

        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    // Category filter
    if (query.category) {
      filteredProducts = filteredProducts.filter(p => p.category === query.category);
    }

    // Location filter
    if (query.location?.state) {
      filteredProducts = filteredProducts.filter(p => p.location.state === query.location!.state);
    }

    // Price range filter
    if (query.priceRange) {
      filteredProducts = filteredProducts.filter(product => {
        const price = query.buyerType === 'b2b' 
          ? product.pricing.wholesale.price 
          : product.pricing.retail.price;
        return price >= query.priceRange!.min && price <= query.priceRange!.max;
      });
    }

    // Pagination
    const total = filteredProducts.length;
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    const products = filteredProducts.slice(offset, offset + limit);

    return {
      products,
      total,
      suggestions: ['tomatoes', 'vegetables', 'fresh produce'],
      filters: {
        categories: [{ name: 'agriculture/vegetables', count: products.length }],
        priceRanges: [{ min: 20, max: 50, count: products.length }],
        locations: [{ state: 'Tamil Nadu', count: products.length }]
      }
    };
  }

  async getProductById(productId: string): Promise<Product | null> {
    return mockProducts.find(p => p.id === productId) || null;
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return mockProducts.filter(p => p.vendorId === vendorId);
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index === -1) {
      throw new Error('Product not found');
    }

    mockProducts[index] = {
      ...mockProducts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return mockProducts[index];
  }
}

export const mockProductService = new MockProductService();

// Add some sample products for development
const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    vendorId: 'vendor-1',
    title: {
      en: 'Fresh Organic Tomatoes',
      hi: 'ताजे जैविक टमाटर',
      ta: 'புதிய இயற்கை தக்காளி'
    },
    description: {
      en: 'Premium quality organic tomatoes, freshly harvested from our farm',
      hi: 'हमारे खेत से ताजे तोड़े गए प्रीमियम गुणवत्ता के जैविक टमाटर',
      ta: 'எங்கள் பண்ணையில் இருந்து புதிதாக அறுவடை செய்யப்பட்ட உயர்தர இயற்கை தக்காளி'
    },
    category: 'agriculture',
    subcategory: 'vegetables',
    tags: ['organic', 'fresh', 'premium'],
    images: ['https://via.placeholder.com/400x300?text=Fresh+Tomatoes'],
    pricing: {
      wholesale: { minQuantity: 50, price: 35, unit: 'kg' },
      retail: { price: 45, unit: 'kg' }
    },
    inventory: { available: 500, unit: 'kg', lastUpdated: new Date().toISOString() },
    location: {
      state: 'Tamil Nadu',
      district: 'Chennai',
      coordinates: [13.0827, 80.2707]
    },
    quality: { grade: 'A', certifications: ['Organic'], harvestDate: '2024-01-20' },
    status: 'active',
    visibility: 'public'
  },
  {
    vendorId: 'vendor-1',
    title: {
      en: 'Premium Basmati Rice',
      hi: 'प्रीमियम बासमती चावल',
      ta: 'உயர்தர பாஸ்மதி அரிசி'
    },
    description: {
      en: 'Aged basmati rice with long grains and aromatic fragrance',
      hi: 'लंबे दाने और सुगंधित खुशबू के साथ पुराना बासमती चावल',
      ta: 'நீண்ட தானியங்கள் மற்றும் நறுமணமுள்ள பாஸ்மதி அரிசி'
    },
    category: 'agriculture',
    subcategory: 'grains',
    tags: ['basmati', 'premium', 'aged'],
    images: ['https://via.placeholder.com/400x300?text=Basmati+Rice'],
    pricing: {
      wholesale: { minQuantity: 100, price: 80, unit: 'kg' },
      retail: { price: 95, unit: 'kg' }
    },
    inventory: { available: 1000, unit: 'kg', lastUpdated: new Date().toISOString() },
    location: {
      state: 'Punjab',
      district: 'Amritsar',
      coordinates: [31.6340, 74.8723]
    },
    quality: { grade: 'Premium', certifications: ['Export Quality'] },
    status: 'active',
    visibility: 'public'
  }
];

// Initialize mock products
sampleProducts.forEach(productData => {
  const product: Product = {
    ...productData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  mockProducts.push(product);
});