import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import * as jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const bedrockClient = new BedrockRuntimeClient({});

const PRICE_HISTORY_TABLE = process.env.PRICE_HISTORY_TABLE!;
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE!;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface PriceQueryRequest {
  query: string;
  language: string;
  location?: {
    state: string;
    district?: string;
  };
  product?: string;
  category?: string;
}

interface MarketDataRequest {
  product?: string;
  category?: string;
  state?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Mock market data for demonstration (in production, this would come from APIs)
const MOCK_MARKET_DATA = {
  'tomatoes': {
    'uttar_pradesh': { current: 35, trend: 'up', change: 5 },
    'maharashtra': { current: 42, trend: 'stable', change: 0 },
    'karnataka': { current: 38, trend: 'down', change: -3 },
    'tamil_nadu': { current: 45, trend: 'up', change: 7 },
  },
  'rice': {
    'punjab': { current: 2800, trend: 'stable', change: 0 },
    'haryana': { current: 2750, trend: 'up', change: 50 },
    'uttar_pradesh': { current: 2650, trend: 'down', change: -25 },
    'west_bengal': { current: 2900, trend: 'up', change: 100 },
  },
  'onions': {
    'maharashtra': { current: 25, trend: 'down', change: -5 },
    'karnataka': { current: 28, trend: 'stable', change: 0 },
    'rajasthan': { current: 30, trend: 'up', change: 3 },
    'gujarat': { current: 27, trend: 'down', change: -2 },
  },
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Price Discovery event:', JSON.stringify(event, null, 2));

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
    const queryParams = event.queryStringParameters || {};

    switch (true) {
      case path.includes('/query'):
        return await handlePriceQuery(body as PriceQueryRequest, headers);
      
      case path.includes('/market-data'):
        return await handleMarketData(queryParams as any, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Price Discovery error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Price Discovery service error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handlePriceQuery(request: PriceQueryRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { query, language, location, product, category } = request;

  try {
    // Parse the natural language query using Bedrock
    const parsedQuery = await parseNaturalLanguageQuery(query, language);
    
    // Get market data based on parsed query
    const marketData = await getMarketData({
      product: parsedQuery.product || product,
      category: parsedQuery.category || category,
      state: parsedQuery.location?.state || location?.state,
    });

    // Generate natural language response
    const response = await generateNaturalLanguageResponse(
      parsedQuery,
      marketData,
      language
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        query: {
          original: query,
          parsed: parsedQuery,
        },
        response: {
          text: response.text,
          // In a real implementation, this would be generated using Polly
          audio: null,
        },
        data: marketData,
      }),
    };
  } catch (error) {
    console.error('Price query error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process price query',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleMarketData(request: MarketDataRequest, headers: any): Promise<APIGatewayProxyResult> {
  try {
    const { product, category, state, dateRange } = request;

    // Get historical price data from DynamoDB
    let priceHistory: any[] = [];
    
    if (product && state) {
      const response = await docClient.send(new QueryCommand({
        TableName: PRICE_HISTORY_TABLE,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': `MARKET#${state}#${product}`,
        },
        ScanIndexForward: false, // Most recent first
        Limit: 30, // Last 30 days
      }));
      
      priceHistory = response.Items || [];
    } else if (category) {
      const response = await docClient.send(new QueryCommand({
        TableName: PRICE_HISTORY_TABLE,
        IndexName: 'ProductIndex',
        KeyConditionExpression: 'product_category = :category',
        ExpressionAttributeValues: {
          ':category': category,
        },
        ScanIndexForward: false,
        Limit: 100,
      }));
      
      priceHistory = response.Items || [];
    }

    // Get current market prices (mock data for demonstration)
    const currentPrices = getCurrentMarketPrices(product, category, state);

    // Calculate trends and analytics
    const analytics = calculatePriceTrends(priceHistory, currentPrices);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        currentPrices,
        priceHistory: priceHistory.slice(0, 10), // Last 10 records
        analytics,
        metadata: {
          product,
          category,
          state,
          dataPoints: priceHistory.length,
        },
      }),
    };
  } catch (error) {
    console.error('Market data error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to get market data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function parseNaturalLanguageQuery(query: string, language: string): Promise<any> {
  const prompt = `You are an AI assistant for a agricultural trading platform in India. Parse the following price query and extract structured information.

Query: "${query}"
Language: ${language}

Extract the following information and respond in JSON format:
{
  "product": "specific product name (e.g., tomatoes, rice, onions)",
  "category": "product category (e.g., vegetables, grains, spices)",
  "location": {
    "state": "state name if mentioned",
    "district": "district name if mentioned"
  },
  "queryType": "current_price | price_trend | price_comparison | market_forecast",
  "timeframe": "today | this_week | this_month | specific_date",
  "intent": "brief description of what user wants to know"
}

Only return the JSON, no other text.`;

  try {
    const response = await bedrockClient.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const parsedResult = JSON.parse(responseBody.content[0].text.trim());
    
    return parsedResult;
  } catch (error) {
    console.error('Query parsing error:', error);
    
    // Fallback: simple keyword extraction
    return {
      product: extractProductFromQuery(query),
      category: 'agriculture',
      location: { state: null, district: null },
      queryType: 'current_price',
      timeframe: 'today',
      intent: 'Get current market price',
    };
  }
}

async function generateNaturalLanguageResponse(parsedQuery: any, marketData: any, language: string): Promise<any> {
  const prompt = `You are an AI assistant for an agricultural trading platform in India. Generate a natural, helpful response about market prices.

Query Information:
- Product: ${parsedQuery.product}
- Location: ${parsedQuery.location?.state || 'Various states'}
- Intent: ${parsedQuery.intent}

Market Data:
${JSON.stringify(marketData, null, 2)}

Generate a response in ${language} that:
1. Directly answers the user's question
2. Provides current price information
3. Mentions price trends if available
4. Gives practical advice for trading
5. Uses simple, clear language suitable for farmers and traders

Keep the response conversational and under 150 words.`;

  try {
    const response = await bedrockClient.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const responseText = responseBody.content[0].text.trim();
    
    return { text: responseText };
  } catch (error) {
    console.error('Response generation error:', error);
    
    // Fallback response
    return {
      text: `Current market price for ${parsedQuery.product}: ₹${marketData.averagePrice || 'N/A'} per kg. Market trend: ${marketData.trend || 'stable'}.`,
    };
  }
}

function getCurrentMarketPrices(product?: string, category?: string, state?: string): any {
  if (product && MOCK_MARKET_DATA[product as keyof typeof MOCK_MARKET_DATA]) {
    const productData = MOCK_MARKET_DATA[product as keyof typeof MOCK_MARKET_DATA];
    
    if (state && productData[state as keyof typeof productData]) {
      return {
        [product]: {
          [state]: productData[state as keyof typeof productData],
        },
      };
    }
    
    return { [product]: productData };
  }

  // Return sample data for category or general query
  return {
    tomatoes: MOCK_MARKET_DATA.tomatoes,
    rice: MOCK_MARKET_DATA.rice,
    onions: MOCK_MARKET_DATA.onions,
  };
}

function calculatePriceTrends(priceHistory: any[], currentPrices: any): any {
  if (priceHistory.length === 0) {
    return {
      trend: 'stable',
      change: 0,
      volatility: 'low',
      recommendation: 'Monitor market conditions',
    };
  }

  // Calculate average price over last 7 days
  const recentPrices = priceHistory.slice(0, 7);
  const averagePrice = recentPrices.reduce((sum, record) => {
    return sum + (record.wholesale_price || record.retail_price || 0);
  }, 0) / recentPrices.length;

  // Calculate price change
  const oldestPrice = priceHistory[priceHistory.length - 1]?.wholesale_price || 0;
  const newestPrice = priceHistory[0]?.wholesale_price || 0;
  const priceChange = ((newestPrice - oldestPrice) / oldestPrice) * 100;

  // Determine trend
  let trend = 'stable';
  if (priceChange > 5) trend = 'up';
  else if (priceChange < -5) trend = 'down';

  // Calculate volatility
  const priceVariance = recentPrices.reduce((sum, record) => {
    const price = record.wholesale_price || record.retail_price || 0;
    return sum + Math.pow(price - averagePrice, 2);
  }, 0) / recentPrices.length;
  
  const volatility = priceVariance > 100 ? 'high' : priceVariance > 25 ? 'medium' : 'low';

  // Generate recommendation
  let recommendation = 'Monitor market conditions';
  if (trend === 'up' && volatility === 'low') {
    recommendation = 'Good time to sell';
  } else if (trend === 'down' && volatility === 'low') {
    recommendation = 'Consider waiting or buying';
  } else if (volatility === 'high') {
    recommendation = 'Market is volatile, trade with caution';
  }

  return {
    averagePrice: Math.round(averagePrice),
    trend,
    change: Math.round(priceChange * 100) / 100,
    volatility,
    recommendation,
    dataPoints: priceHistory.length,
  };
}

function extractProductFromQuery(query: string): string | null {
  const products = ['tomatoes', 'rice', 'onions', 'wheat', 'potatoes', 'garlic', 'ginger'];
  const lowerQuery = query.toLowerCase();
  
  for (const product of products) {
    if (lowerQuery.includes(product)) {
      return product;
    }
  }
  
  // Check for Hindi/regional language terms (simplified)
  const hindiTerms: { [key: string]: string } = {
    'टमाटर': 'tomatoes',
    'चावल': 'rice',
    'प्याज': 'onions',
    'गेहूं': 'wheat',
    'आलू': 'potatoes',
  };
  
  for (const [hindi, english] of Object.entries(hindiTerms)) {
    if (lowerQuery.includes(hindi)) {
      return english;
    }
  }
  
  return null;
}