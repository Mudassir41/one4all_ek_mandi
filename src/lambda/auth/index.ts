import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand, SignUpCommand, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({});

const USERS_TABLE = process.env.USERS_TABLE!;
const USER_POOL_ID = process.env.USER_POOL_ID!;
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID!;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface LoginRequest {
  phone: string;
  password?: string;
  otp?: string;
  challengeName?: string;
  session?: string;
}

interface RegisterRequest {
  phone: string;
  name: string;
  userType: 'vendor' | 'b2b_buyer' | 'b2c_buyer';
  languages: string[];
  location: {
    state: string;
    district: string;
    coordinates?: [number, number];
  };
}

interface VerifyRequest {
  phone: string;
  code: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Auth event:', JSON.stringify(event, null, 2));

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
      case path.includes('/login'):
        return await handleLogin(body as LoginRequest, headers);
      
      case path.includes('/register'):
        return await handleRegister(body as RegisterRequest, headers);
      
      case path.includes('/verify'):
        return await handleVerify(body as VerifyRequest, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Endpoint not found' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

async function handleLogin(request: LoginRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { phone, password, otp, challengeName, session } = request;

  try {
    if (challengeName === 'SMS_MFA' && otp && session) {
      // Handle MFA challenge
      const response = await cognitoClient.send(new RespondToAuthChallengeCommand({
        ClientId: USER_POOL_CLIENT_ID,
        ChallengeName: 'SMS_MFA',
        Session: session,
        ChallengeResponses: {
          SMS_MFA_CODE: otp,
          USERNAME: phone,
        },
      }));

      if (response.AuthenticationResult?.AccessToken) {
        const userProfile = await getUserProfile(phone);
        const token = generateJWT(userProfile);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            token,
            user: userProfile,
          }),
        };
      }
    } else if (password) {
      // Initial login with password
      const response = await cognitoClient.send(new InitiateAuthCommand({
        ClientId: USER_POOL_CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: phone,
          PASSWORD: password,
        },
      }));

      if (response.ChallengeName === 'SMS_MFA') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            challengeName: 'SMS_MFA',
            session: response.Session,
            message: 'OTP sent to your phone',
          }),
        };
      }

      if (response.AuthenticationResult?.AccessToken) {
        const userProfile = await getUserProfile(phone);
        const token = generateJWT(userProfile);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            token,
            user: userProfile,
          }),
        };
      }
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid login request' }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleRegister(request: RegisterRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { phone, name, userType, languages, location } = request;

  try {
    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create user in Cognito
    await cognitoClient.send(new SignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: phone,
      Password: tempPassword,
      UserAttributes: [
        { Name: 'phone_number', Value: phone },
        { Name: 'custom:user_type', Value: userType },
        { Name: 'custom:languages', Value: JSON.stringify(languages) },
        { Name: 'custom:state', Value: location.state },
        { Name: 'custom:district', Value: location.district },
      ],
    }));

    // Create user profile in DynamoDB
    const userId = uuidv4();
    const userProfile = {
      PK: `USER#${userId}`,
      SK: 'PROFILE',
      user_id: userId,
      phone,
      name,
      user_type: userType,
      languages,
      location,
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: userProfile,
    }));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Registration successful. Please verify your phone number.',
        userId,
        tempPassword, // In production, this would be sent via SMS
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function handleVerify(request: VerifyRequest, headers: any): Promise<APIGatewayProxyResult> {
  const { phone, code } = request;

  try {
    // Confirm signup in Cognito
    await cognitoClient.send(new ConfirmSignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: phone,
      ConfirmationCode: code,
    }));

    // Update verification status in DynamoDB
    const userProfile = await getUserProfile(phone);
    if (userProfile) {
      await docClient.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { PK: userProfile.PK, SK: 'PROFILE' },
        UpdateExpression: 'SET verification_status = :status, updated_at = :updated',
        ExpressionAttributeValues: {
          ':status': 'verified',
          ':updated': new Date().toISOString(),
        },
      }));

      userProfile.verification_status = 'verified';
      const token = generateJWT(userProfile);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Phone number verified successfully',
          token,
          user: userProfile,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'User profile not found' }),
    };
  } catch (error) {
    console.error('Verification error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}

async function getUserProfile(phone: string) {
  try {
    const response = await docClient.send(new GetCommand({
      TableName: USERS_TABLE,
      IndexName: 'PhoneIndex',
      Key: { phone },
    }));

    return response.Item;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

function generateJWT(user: any): string {
  const payload = {
    userId: user.user_id,
    phone: user.phone,
    userType: user.user_type,
    languages: user.languages,
    location: user.location,
    verified: user.verification_status === 'verified',
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}