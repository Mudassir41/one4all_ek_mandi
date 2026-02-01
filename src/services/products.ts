import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { translationService, ProductCategorizationResult, PriceSuggestion } from './translation';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

export interface Product {
  id: string;
  vendorId: string;
  title: Record<string, string>; // Multi-language titles
  description: Record<string, string>; // Multi-language descriptions
  category: string;
  subcategory: string;
  tags: string[];
  images: string[]; // S3 URLs
  voiceDescription?: {
    originalAudio: string;
    originalText: string;
    language: string;
  };
  pricing: {
    wholesale: {
      minQuantity: number;
      price: number;
      unit: string;
    };
    retail: {
      price: number;
      unit: string;
    };
  };
  inventory: {
    available: number;
    unit: string;
    lastUpdated: string;
  };
  location: {
    state: string;
    district: string;
    coordinates: [number, number];
  };
  quality: {
    grade?: string;
    certifications?: string[];
    harvestDate?: string;
  };
  status: 'draft' | 'active' | 'inactive' | 'sold_out';
  visibility: 'public' | 'b2b_only' | 'b2c_only';
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchQuery {
  text?: string;
  voice?: Buffer;
  language?: string;
  category?: string;
  subcategory?: string;
  location?: {
    state?: string;
    district?: string;
    radius?: number; // km
  };
  priceRange?: {
    min: number;
    max: number;
  };
  buyerType?: 'b2b' | 'b2c';
  sortBy?: 'price' | 'distance' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  suggestions: string[];
  filters: {
    categories: Array<{ name: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
    locations: Array<{ state: string; count: number }>;
  };
}

export class ProductService {
  private readonly BUCKET_NAME = process.env.S3_BUCKET_PRODUCTS || 'ek-bharath-ek-mandi-products';
  private readonly TABLE_NAME = process.env.DYNAMODB_TABLE_PRODUCTS || 'EkBharathEkMandi-Products';

  /**
   * Create a new product listing with voice description
   */
  async createProduct(productData: {
    vendorId: string;
    voiceDescription?: {
      audio: Buffer;
      language: string;
    };
    textDescription?: string;
    images?: Buffer[];
    location: {
      state: string;
      district: string;
      coordinates: [number, number];
    };
    pricing?: {
      wholesale?: { minQuantity: number; price: number; unit: string };
      retail?: { price: number; unit: string };
    };
    inventory?: {
      available: number;
      unit: string;
    };
    quality?: {
      grade?: string;
      certifications?: string[];
      harvestDate?: string;
    };
  }): Promise<Product> {
    try {
      const productId = uuidv4();
      const now = new Date().toISOString();

      let title: Record<string, string> = {};
      let description: Record<string, string> = {};
      let category = 'agriculture';
      let subcategory = 'vegetables';
      let tags: string[] = [];
      let voiceDescription: Product['voiceDescription'];
      let aiCategorization: ProductCategorizationResult;

      // Process voice description if provided
      if (productData.voiceDescription) {
        const transcription = await translationService.transcribeAudio(
          productData.voiceDescription.audio,
          productData.voiceDescription.language
        );

        // Store original audio
        const audioKey = `voice/${productId}/original.wav`;
        await s3Client.send(new PutObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: audioKey,
          Body: productData.voiceDescription.audio,
          ContentType: 'audio/wav'
        }));

        const audioUrl = await getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: audioKey
        }), { expiresIn: 86400 }); // 24 hours

        voiceDescription = {
          originalAudio: audioUrl,
          originalText: transcription.text,
          language: productData.voiceDescription.language
        };

        // AI categorization from voice
        aiCategorization = await translationService.categorizeProduct(
          transcription.text,
          productData.voiceDescription.language
        );

        category = aiCategorization.category;
        subcategory = aiCategorization.subcategory;
        tags = aiCategorization.suggestedTags;

        // Set description in original language
        description[productData.voiceDescription.language] = transcription.text;
        
        // Generate title from description (first few words)
        const words = transcription.text.split(' ').slice(0, 5).join(' ');
        title[productData.voiceDescription.language] = words;

        // Translate to other languages
        const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn'];
        for (const lang of supportedLanguages) {
          if (lang !== productData.voiceDescription.language) {
            try {
              const titleTranslation = await translationService.translateText(
                title[productData.voiceDescription.language],
                productData.voiceDescription.language,
                lang
              );
              title[lang] = titleTranslation.translatedText;

              const descTranslation = await translationService.translateText(
                description[productData.voiceDescription.language],
                productData.voiceDescription.language,
                lang
              );
              description[lang] = descTranslation.translatedText;
            } catch (error) {
              console.error(`Translation error for ${lang}:`, error);
            }
          }
        }
      } else if (productData.textDescription) {
        // Process text description
        aiCategorization = await translationService.categorizeProduct(productData.textDescription);
        
        category = aiCategorization.category;
        subcategory = aiCategorization.subcategory;
        tags = aiCategorization.suggestedTags;
        
        description['en'] = productData.textDescription;
        title['en'] = productData.textDescription.split(' ').slice(0, 5).join(' ');
      }

      // Process images
      const imageUrls: string[] = [];
      if (productData.images && productData.images.length > 0) {
        for (let i = 0; i < productData.images.length; i++) {
          const imageKey = `images/${productId}/${i}.jpg`;
          await s3Client.send(new PutObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: imageKey,
            Body: productData.images[i],
            ContentType: 'image/jpeg'
          }));

          const imageUrl = await getSignedUrl(s3Client, new GetObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: imageKey
          }), { expiresIn: 86400 });

          imageUrls.push(imageUrl);
        }
      }

      // AI price suggestion
      let pricing = productData.pricing;
      if (!pricing && title['en']) {
        try {
          const priceSuggestion = await translationService.suggestPrice(
            title['en'],
            category,
            productData.location.state,
            productData.inventory?.available || 100
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
        } catch (error) {
          console.error('Price suggestion error:', error);
          // Fallback pricing
          pricing = {
            wholesale: { minQuantity: 50, price: 35, unit: 'kg' },
            retail: { price: 45, unit: 'kg' }
          };
        }
      }

      const product: Product = {
        id: productId,
        vendorId: productData.vendorId,
        title,
        description,
        category,
        subcategory,
        tags,
        images: imageUrls,
        voiceDescription,
        pricing: pricing || {
          wholesale: { minQuantity: 50, price: 35, unit: 'kg' },
          retail: { price: 45, unit: 'kg' }
        },
        inventory: productData.inventory || {
          available: 100,
          unit: 'kg',
          lastUpdated: now
        },
        location: productData.location,
        quality: productData.quality || {},
        status: 'active',
        visibility: 'public',
        createdAt: now,
        updatedAt: now
      };

      // Store in DynamoDB
      await docClient.send(new PutCommand({
        TableName: this.TABLE_NAME,
        Item: {
          PK: `PRODUCT#${productId}`,
          SK: 'DETAILS',
          ...product,
          // GSI for category search
          GSI1PK: `CATEGORY#${category}`,
          GSI1SK: `${subcategory}#${now}`,
          // GSI for location search
          GSI2PK: `LOCATION#${productData.location.state}`,
          GSI2SK: `${productData.location.district}#${now}`,
          // GSI for vendor products
          GSI3PK: `VENDOR#${productData.vendorId}`,
          GSI3SK: `PRODUCT#${now}`
        }
      }));

      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Search products with multilingual support
   */
  async searchProducts(query: ProductSearchQuery): Promise<ProductSearchResult> {
    try {
      let searchText = query.text;

      // Process voice search
      if (query.voice && query.language) {
        const transcription = await translationService.transcribeAudio(query.voice, query.language);
        searchText = transcription.text;

        // Translate to English for better search
        if (query.language !== 'en') {
          const translation = await translationService.translateText(searchText, query.language, 'en');
          searchText = translation.translatedText;
        }
      }

      // Build search parameters
      let scanParams: any = {
        TableName: this.TABLE_NAME,
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'active'
        }
      };

      // Add category filter
      if (query.category) {
        scanParams.FilterExpression += ' AND category = :category';
        scanParams.ExpressionAttributeValues[':category'] = query.category;
      }

      // Add subcategory filter
      if (query.subcategory) {
        scanParams.FilterExpression += ' AND subcategory = :subcategory';
        scanParams.ExpressionAttributeValues[':subcategory'] = query.subcategory;
      }

      // Add location filter
      if (query.location?.state) {
        scanParams.FilterExpression += ' AND #location.#state = :state';
        scanParams.ExpressionAttributeNames['#location'] = 'location';
        scanParams.ExpressionAttributeNames['#state'] = 'state';
        scanParams.ExpressionAttributeValues[':state'] = query.location.state;
      }

      // Add buyer type visibility filter
      if (query.buyerType) {
        scanParams.FilterExpression += ' AND (visibility = :public OR visibility = :buyerType)';
        scanParams.ExpressionAttributeValues[':public'] = 'public';
        scanParams.ExpressionAttributeValues[':buyerType'] = `${query.buyerType}_only`;
      }

      const response = await docClient.send(new ScanCommand(scanParams));
      let products = (response.Items || []) as Product[];

      // Text search in titles and descriptions
      if (searchText) {
        const searchTerms = searchText.toLowerCase().split(' ');
        products = products.filter(product => {
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

      // Price range filter
      if (query.priceRange) {
        products = products.filter(product => {
          const price = query.buyerType === 'b2b' 
            ? product.pricing.wholesale.price 
            : product.pricing.retail.price;
          return price >= query.priceRange!.min && price <= query.priceRange!.max;
        });
      }

      // Distance filter (if coordinates provided)
      if (query.location?.radius && query.location.coordinates) {
        products = products.filter(product => {
          const distance = this.calculateDistance(
            query.location!.coordinates!,
            product.location.coordinates
          );
          return distance <= query.location!.radius!;
        });
      }

      // Sort products
      if (query.sortBy) {
        products.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (query.sortBy) {
            case 'price':
              aValue = query.buyerType === 'b2b' ? a.pricing.wholesale.price : a.pricing.retail.price;
              bValue = query.buyerType === 'b2b' ? b.pricing.wholesale.price : b.pricing.retail.price;
              break;
            case 'date':
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
              break;
            case 'distance':
              if (query.location?.coordinates) {
                aValue = this.calculateDistance(query.location.coordinates, a.location.coordinates);
                bValue = this.calculateDistance(query.location.coordinates, b.location.coordinates);
              } else {
                return 0;
              }
              break;
            default:
              return 0;
          }

          if (query.sortOrder === 'desc') {
            return bValue - aValue;
          }
          return aValue - bValue;
        });
      }

      // Pagination
      const total = products.length;
      const offset = query.offset || 0;
      const limit = query.limit || 20;
      products = products.slice(offset, offset + limit);

      // Generate suggestions (simple implementation)
      const suggestions = this.generateSearchSuggestions(searchText, products);

      // Generate filters
      const filters = this.generateSearchFilters(products);

      return {
        products,
        total,
        suggestions,
        filters
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<Product | null> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: this.TABLE_NAME,
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: 'DETAILS'
        }
      }));

      return response.Item as Product || null;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  /**
   * Get products by vendor
   */
  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    try {
      const response = await docClient.send(new QueryCommand({
        TableName: this.TABLE_NAME,
        IndexName: 'GSI3',
        KeyConditionExpression: 'GSI3PK = :vendorPK',
        ExpressionAttributeValues: {
          ':vendorPK': `VENDOR#${vendorId}`
        }
      }));

      return (response.Items || []) as Product[];
    } catch (error) {
      console.error('Error getting vendor products:', error);
      return [];
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    try {
      const updateExpression = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Build update expression dynamically
      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'createdAt') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = value;
        }
      });

      // Always update the updatedAt field
      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      await docClient.send(new UpdateCommand({
        TableName: this.TABLE_NAME,
        Key: {
          PK: `PRODUCT#${productId}`,
          SK: 'DETAILS'
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      // Return updated product
      return await this.getProductById(productId) as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2[0] - coord1[0]);
    const dLon = this.toRadians(coord2[1] - coord1[1]);
    const lat1 = this.toRadians(coord1[0]);
    const lat2 = this.toRadians(coord2[0]);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Generate search suggestions
   */
  private generateSearchSuggestions(searchText: string | undefined, products: Product[]): string[] {
    if (!searchText) return [];

    const suggestions = new Set<string>();
    
    products.forEach(product => {
      // Add category and subcategory suggestions
      suggestions.add(product.category);
      suggestions.add(product.subcategory);
      
      // Add tag suggestions
      product.tags.forEach(tag => suggestions.add(tag));
      
      // Add title suggestions
      Object.values(product.title).forEach(title => {
        title.split(' ').forEach(word => {
          if (word.length > 3) suggestions.add(word);
        });
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Generate search filters
   */
  private generateSearchFilters(products: Product[]) {
    const categories = new Map<string, number>();
    const locations = new Map<string, number>();
    const priceRanges = [
      { min: 0, max: 25, count: 0 },
      { min: 25, max: 50, count: 0 },
      { min: 50, max: 100, count: 0 },
      { min: 100, max: 200, count: 0 },
      { min: 200, max: Infinity, count: 0 }
    ];

    products.forEach(product => {
      // Count categories
      const categoryKey = `${product.category}/${product.subcategory}`;
      categories.set(categoryKey, (categories.get(categoryKey) || 0) + 1);

      // Count locations
      locations.set(product.location.state, (locations.get(product.location.state) || 0) + 1);

      // Count price ranges
      const price = product.pricing.retail.price;
      priceRanges.forEach(range => {
        if (price >= range.min && price < range.max) {
          range.count++;
        }
      });
    });

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      locations: Array.from(locations.entries()).map(([state, count]) => ({ state, count })),
      priceRanges: priceRanges.filter(range => range.count > 0)
    };
  }
}

export const productService = new ProductService();