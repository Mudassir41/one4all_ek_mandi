import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  userType: 'vendor' | 'b2b_buyer' | 'b2c_buyer';
  languages: string[];
  location: {
    state: string;
    district: string;
    coordinates: [number, number];
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface OTPSession {
  sessionId: string;
  phone: string;
  otp: string;
  expiresAt: string;
  attempts: number;
  verified: boolean;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_OTP_ATTEMPTS = 3;

  /**
   * Generate and send OTP for phone authentication
   */
  async sendOTP(phone: string): Promise<{ sessionId: string; message: string }> {
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const sessionId = uuidv4();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

      // Store OTP session in DynamoDB
      const otpSession: OTPSession = {
        sessionId,
        phone,
        otp: await bcrypt.hash(otp, 10), // Hash OTP for security
        expiresAt,
        attempts: 0,
        verified: false
      };

      await docClient.send(new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Item: {
          PK: `OTP_SESSION#${sessionId}`,
          SK: 'DETAILS',
          ...otpSession,
          TTL: Math.floor(Date.now() / 1000) + (this.OTP_EXPIRY_MINUTES * 60)
        }
      }));

      // In production, integrate with SMS service (AWS SNS)
      // For demo, we'll log the OTP
      console.log(`OTP for ${phone}: ${otp}`);

      return {
        sessionId,
        message: `OTP sent to ${phone}. Valid for ${this.OTP_EXPIRY_MINUTES} minutes.`
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  /**
   * Verify OTP and return session token
   */
  async verifyOTP(sessionId: string, otp: string): Promise<{ token: string; user?: User }> {
    try {
      // Get OTP session
      const response = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Key: {
          PK: `OTP_SESSION#${sessionId}`,
          SK: 'DETAILS'
        }
      }));

      const otpSession = response.Item as OTPSession;
      if (!otpSession) {
        throw new Error('Invalid or expired OTP session');
      }

      // Check expiry
      if (new Date() > new Date(otpSession.expiresAt)) {
        throw new Error('OTP has expired');
      }

      // Check attempts
      if (otpSession.attempts >= this.MAX_OTP_ATTEMPTS) {
        throw new Error('Maximum OTP attempts exceeded');
      }

      // Verify OTP
      const isValidOTP = await bcrypt.compare(otp, otpSession.otp);
      if (!isValidOTP) {
        // Increment attempts
        await docClient.send(new UpdateCommand({
          TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
          Key: {
            PK: `OTP_SESSION#${sessionId}`,
            SK: 'DETAILS'
          },
          UpdateExpression: 'SET attempts = attempts + :inc',
          ExpressionAttributeValues: {
            ':inc': 1
          }
        }));
        throw new Error('Invalid OTP');
      }

      // Mark session as verified
      await docClient.send(new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Key: {
          PK: `OTP_SESSION#${sessionId}`,
          SK: 'DETAILS'
        },
        UpdateExpression: 'SET verified = :verified',
        ExpressionAttributeValues: {
          ':verified': true
        }
      }));

      // Check if user exists
      const existingUser = await this.getUserByPhone(otpSession.phone);
      
      // Generate JWT token
      const tokenPayload = {
        sessionId,
        phone: otpSession.phone,
        userId: existingUser?.id,
        verified: true
      };

      const token = jwt.sign(tokenPayload, this.JWT_SECRET, { expiresIn: '24h' });

      return {
        token,
        user: existingUser
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async registerUser(userData: {
    phone: string;
    name: string;
    email?: string;
    userType: 'vendor' | 'b2b_buyer' | 'b2c_buyer';
    languages: string[];
    location: {
      state: string;
      district: string;
      coordinates: [number, number];
    };
  }): Promise<User> {
    try {
      const userId = uuidv4();
      const now = new Date().toISOString();

      const user: User = {
        id: userId,
        ...userData,
        verificationStatus: 'pending',
        createdAt: now,
        updatedAt: now
      };

      // Store user in DynamoDB
      await docClient.send(new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Item: {
          PK: `USER#${userId}`,
          SK: 'PROFILE',
          ...user,
          // GSI for phone lookup
          GSI1PK: `PHONE#${userData.phone}`,
          GSI1SK: 'USER'
        }
      }));

      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error('Failed to register user');
    }
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      // Query GSI for phone lookup
      const response = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Key: {
          GSI1PK: `PHONE#${phone}`,
          GSI1SK: 'USER'
        },
        IndexName: 'GSI1'
      }));

      return response.Item as User || null;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE'
        }
      }));

      return response.Item as User || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
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
        TableName: process.env.DYNAMODB_TABLE_USERS || 'EkBharathEkMandi-Users',
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE'
        },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));

      // Return updated user
      return await this.getUserById(userId) as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Middleware for role-based access control
   */
  hasRole(userType: string, allowedRoles: string[]): boolean {
    return allowedRoles.includes(userType);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, this.JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await this.getUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const tokenPayload = {
        userId: user.id,
        phone: user.phone,
        userType: user.userType,
        verified: true
      };

      return jwt.sign(tokenPayload, this.JWT_SECRET, { expiresIn: '24h' });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

export const authService = new AuthService();