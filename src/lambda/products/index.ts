import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({});

const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const MEDIA_BUCKET = process.env.MEDIA_BUCKET!;
const PRICE_HISTORY_TABLE = process.env.PRICE_HISTORY_TABLE!;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface CreateProductRequest {
  title: { [language: string]: string };
  description: { [language: string]: string };
  category: string;
  subcategory: string;
  pricing: {
    wholesale?: { min_quantity: number; price: number };
    retail?: { price: number };
  };
  location: {
    state: string;
    district: string;
    coordinates?: [number, number];
  };
  images?: string[]; // Base64 encoded images
  quantity_available: number;
  unit: string;
  harvest_date?: string;
  expiry_date?: string;
}

interface SearchProductsRequest {
  query?: string;
  category?: string;
  state?: string;
  priceRange?: [number, number];
  buyerType?: 'B2B' | 'B2C';
  limit?: number;
  lastEvaluatedKey?: any;
}

interface UpdateProductRequest {
  productId: string;
  updates: Partial<CreateProductRequest>;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Products event:', JSON.stringify(event, null, 2));

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
    if (!user && !path.includes('/search')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const queryParams = event.queryStringParameters || {};

    switch (true) {
      case method === 'POST' && path.includes('/products') && !path.includes('/search'):
        return await handleCreateProduct(body as CreateProductRequest, user, headers);
      
      case method === 'GET' && path.includes('/products') && path.includes('/search'):
        return await handleSearchProducts(queryParams as any, headers);
      
      case method === 'GET' && path.includes('/products/'):
        const productId = extractProductIdFromPath(path);
        return await handleGetProduct(productId, headers);
      
      case method === 'PUT' && path.includes('/products/'):
        const updateProductId = extractProductIdFromPath(path);
        return await handleUpdateProduct({ ...body, productId: updateProductId }, user, headers);
      
      case method === 'DELETE' && path.includes('/products/'):
        const deleteProductId = extractProductIdFromPath(path);
        return await handleDeleteProduct(deleteProductId, user, headers);
      
      case method === 'GET' && path.includes('/products'):
        return await handleGetVendorProducts(user, queryParams, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Products error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Products service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handleCreateProduct(request: CreateProductRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  if (user.userType !== 'vendor') {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Only vendors can create products' }),
    };
  }

  try {
    const productId = uuidv4();
    const imageUrls: string[] = [];

    // Upload images to S3 if provided
    if (request.images && request.images.length > 0) {
      for (let i = 0; i < request.images.length; i++) {
        const imageData = request.images[i];
        const imageKey = `products/${productId}/image-${i + 1}.jpg`;
        
        const imageBuffer = Buffer.from(imageData, 'base64');
        await s3Client.send(new PutObjectCommand({
          Bucket: MEDIA_BUCKET,
          Key: imageKey,
          Body: imageBuffer,
          ContentType: 'image/jpeg',
        }));

        imageUrls.push(`s3://${MEDIA_BUCKET}/${imageKey}`);
      }
    }

    // Create price sort key for price-based queries
    const basePriceForSorting = request.pricing.retail?.price || request.pricing.wholesale?.price || 0;
    const priceSortKey = `${basePriceForSorting.toString().padStart(10, '0')}#${new Date().toISOString()}`;

    const product = {
      PK: `PRODUCT#${productId}`,
      SK: 'DETAILS',
      product_id: productId,
      vendor_id: user.userId,
      title: request.title,
      description: request.description,
      category: request.category,
      subcategory: request.subcategory,
      pricing: request.pricing,
      location: request.location,
      images: imageUrls,
      quantity_available: request.quantity_available,
      unit: request.unit,
      harvest_date: request.harvest_date,
      expiry_date: request.expiry_date,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Additional fields for GSI queries
      state: request.location.state,
      price_sort_key: priceSortKey,
    };

    await docClient.send(new PutCommand({
      TableName: PRODUCTS_TABLE,
      Item: product,
    }));

    // Record price in price history for market analysis
    await recordPriceHistory(productId, request.category, request.location.state, request.pricing);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        product: {
          ...product,
          images: await generateSignedUrls(imageUrls),
        },
      }),
    };
  } catch (error) {
    console.error('Create product error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleSearchProducts(request: SearchProductsRequest, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { query, category, state, priceRange, buyerType, limit = 20, lastEvaluatedKey } = request;

    let searchResults: any[] = [];

    if (category) {
      // Search by category
      const response = await docClient.send(new QueryCommand({
        TableName: PRODUCTS_TABLE,
        IndexName: 'CategoryIndex',
        KeyConditionExpression: 'category = :category',
        FilterExpression: 'attribute_exists(PK) AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':category': category,
          ':status': 'active',
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      }));

      searchResults = response.Items || [];
    } else if (state) {
      // Search by location
      const response = await docClient.send(new QueryCommand({
        TableName: PRODUCTS_TABLE,
        IndexName: 'LocationIndex',
        KeyConditionExpression: '#state = :state',
        FilterExpression: 'attribute_exists(PK) AND #status = :status',
        ExpressionAttributeNames: {
          '#state': 'state',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':state': state,
          ':status': 'active',
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      }));

      searchResults = response.Items || [];
    } else {
      // General search - scan all active products
      const response = await docClient.send(new ScanCommand({
        TableName: PRODUCTS_TABLE,
        FilterExpression: 'attribute_exists(PK) AND #status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'active',
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      }));

      searchResults = response.Items || [];
    }

    // Apply additional filters
    if (priceRange) {
      searchResults = searchResults.filter(product => {
        const price = product.pricing?.retail?.price || product.pricing?.wholesale?.price || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    if (buyerType) {
      searchResults = searchResults.filter(product => {
        if (buyerType === 'B2B') {
          return product.pricing?.wholesale;
        } else {
          return product.pricing?.retail;
        }
      });
    }

    if (query) {
      // Simple text search in titles and descriptions
      const searchTerm = query.toLowerCase();
      searchResults = searchResults.filter(product => {
        const titleMatch = Object.values(product.title || {}).some((title: any) => 
          title.toLowerCase().includes(searchTerm)
        );
        const descMatch = Object.values(product.description || {}).some((desc: any) => 
          desc.toLowerCase().includes(searchTerm)
        );
        return titleMatch || descMatch;
      });
    }

    // Generate signed URLs for images
    const productsWithSignedUrls = await Promise.all(
      searchResults.map(async (product) => ({
        ...product,
        images: await generateSignedUrls(product.images || []),
      }))
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products: productsWithSignedUrls,
        count: productsWithSignedUrls.length,
        lastEvaluatedKey: searchResults.length === limit ? lastEvaluatedKey : null,
      }),
    };
  } catch (error) {
    console.error('Search products error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to search products',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleGetProduct(productId: string, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const response = await docClient.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
    }));

    if (!response.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    const product = {
      ...response.Item,
      images: await generateSignedUrls(response.Item.images || []),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        product,
      }),
    };
  } catch (error) {
    console.error('Get product error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get product',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleUpdateProduct(request: UpdateProductRequest, user: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { productId, updates } = request;

    // First, get the existing product to verify ownership
    const existingProduct = await docClient.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
    }));

    if (!existingProduct.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    if (existingProduct.Item.vendor_id !== user.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to update this product' }),
      };
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'productId' && value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    updateExpressions.push('#updated_at = :updated_at');
    expressionAttributeNames['#updated_at'] = 'updated_at';
    expressionAttributeValues[':updated_at'] = new Date().toISOString();

    await docClient.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Product updated successfully',
      }),
    };
  } catch (error) {
    console.error('Update product error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleDeleteProduct(productId: string, user: any, headers: any): Promise<APIGatewayProxyResult> {
  try {
    // First, get the existing product to verify ownership
    const existingProduct = await docClient.send(new GetCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
    }));

    if (!existingProduct.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Product not found' }),
      };
    }

    if (existingProduct.Item.vendor_id !== user.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Not authorized to delete this product' }),
      };
    }

    // Soft delete by updating status
    await docClient.send(new UpdateCommand({
      TableName: PRODUCTS_TABLE,
      Key: {
        PK: `PRODUCT#${productId}`,
        SK: 'DETAILS',
      },
      UpdateExpression: 'SET #status = :status, updated_at = :updated_at',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'deleted',
        ':updated_at': new Date().toISOString(),
      },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Product deleted successfully',
      }),
    };
  } catch (error) {
    console.error('Delete product error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleGetVendorProducts(user: any, queryParams: any, headers: any): Promise<APIGatewayProxyResult> {
  if (user.userType !== 'vendor') {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Only vendors can access this endpoint' }),
    };
  }

  try {
    const { limit = 20, lastEvaluatedKey } = queryParams;

    const response = await docClient.send(new QueryCommand({
      TableName: PRODUCTS_TABLE,
      IndexName: 'VendorIndex',
      KeyConditionExpression: 'vendor_id = :vendorId',
      FilterExpression: '#status <> :deletedStatus',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':vendorId': user.userId,
        ':deletedStatus': 'deleted',
      },
      Limit: parseInt(limit),
      ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
      ScanIndexForward: false, // Most recent first
    }));

    const productsWithSignedUrls = await Promise.all(
      (response.Items || []).map(async (product) => ({
        ...product,
        images: await generateSignedUrls(product.images || []),
      }))
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products: productsWithSignedUrls,
        count: productsWithSignedUrls.length,
        lastEvaluatedKey: response.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error('Get vendor products error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get vendor products',
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

function extractProductIdFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

async function generateSignedUrls(s3Urls: string[]): Promise<string[]> {
  const signedUrls = await Promise.all(
    s3Urls.map(async (s3Url) => {
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
    })
  );

  return signedUrls;
}

async function recordPriceHistory(productId: string, category: string, state: string, pricing: any): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const priceData = {
      PK: `MARKET#${state}#${category}`,
      SK: `DATE#${date}`,
      product_id: productId,
      product_category: category,
      state,
      date,
      wholesale_price: pricing.wholesale?.price,
      retail_price: pricing.retail?.price,
      recorded_at: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: PRICE_HISTORY_TABLE,
      Item: priceData,
    }));
  } catch (error) {
    console.error('Error recording price history:', error);
    // Don't fail the main operation if price history fails
  }
}