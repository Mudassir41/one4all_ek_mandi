import { AuthService } from '../auth';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import jwt from 'jsonwebtoken';

// Mock AWS SDK
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn()
  },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  UpdateCommand: jest.fn()
}));

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: jest.fn().mockImplementation(() => ({}))
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-otp'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockDocClient: jest.Mocked<DynamoDBDocumentClient>;

  beforeEach(() => {
    mockDocClient = {
      send: jest.fn()
    } as any;
    
    // Mock DynamoDBDocumentClient.from to return our mock
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue(mockDocClient);
    
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOTP', () => {
    it('should generate and store OTP session', async () => {
      mockDocClient.send.mockResolvedValueOnce({});

      const result = await authService.sendOTP('+919876543210');

      expect(result).toEqual({
        sessionId: 'test-uuid',
        message: 'OTP sent to +919876543210. Valid for 5 minutes.'
      });

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'EkBharathEkMandi-Users',
            Item: expect.objectContaining({
              PK: 'OTP_SESSION#test-uuid',
              SK: 'DETAILS',
              sessionId: 'test-uuid',
              phone: '+919876543210',
              otp: 'hashed-otp',
              attempts: 0,
              verified: false
            })
          })
        })
      );
    });

    it('should handle errors during OTP generation', async () => {
      mockDocClient.send.mockRejectedValueOnce(new Error('DynamoDB error'));

      await expect(authService.sendOTP('+919876543210')).rejects.toThrow('Failed to send OTP');
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP and return token', async () => {
      const mockOtpSession = {
        sessionId: 'test-session',
        phone: '+919876543210',
        otp: 'hashed-otp',
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
        attempts: 0,
        verified: false
      };

      // Mock getting OTP session
      mockDocClient.send
        .mockResolvedValueOnce({ Item: mockOtpSession })
        .mockResolvedValueOnce({}) // Update verified status
        .mockResolvedValueOnce({ Item: null }); // No existing user

      const result = await authService.verifyOTP('test-session', '123456');

      expect(result.token).toBeDefined();
      expect(result.user).toBeNull();
      
      // Verify JWT token payload
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'fallback-secret') as any;
      expect(decoded.sessionId).toBe('test-session');
      expect(decoded.phone).toBe('+919876543210');
      expect(decoded.verified).toBe(true);
    });

    it('should reject expired OTP', async () => {
      const mockOtpSession = {
        sessionId: 'test-session',
        phone: '+919876543210',
        otp: 'hashed-otp',
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
        attempts: 0,
        verified: false
      };

      mockDocClient.send.mockResolvedValueOnce({ Item: mockOtpSession });

      await expect(authService.verifyOTP('test-session', '123456')).rejects.toThrow('OTP has expired');
    });

    it('should reject invalid OTP and increment attempts', async () => {
      const mockOtpSession = {
        sessionId: 'test-session',
        phone: '+919876543210',
        otp: 'hashed-otp',
        expiresAt: new Date(Date.now() + 300000).toISOString(),
        attempts: 0,
        verified: false
      };

      mockDocClient.send
        .mockResolvedValueOnce({ Item: mockOtpSession })
        .mockResolvedValueOnce({}); // Update attempts

      // Mock bcrypt.compare to return false for invalid OTP
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(authService.verifyOTP('test-session', '123456')).rejects.toThrow('Invalid OTP');

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            UpdateExpression: 'SET attempts = attempts + :inc',
            ExpressionAttributeValues: { ':inc': 1 }
          })
        })
      );
    });
  });

  describe('registerUser', () => {
    it('should create new user successfully', async () => {
      const userData = {
        phone: '+919876543210',
        name: 'Test User',
        email: 'test@example.com',
        userType: 'vendor' as const,
        languages: ['en', 'hi'],
        location: {
          state: 'Karnataka',
          district: 'Bangalore',
          coordinates: [12.9716, 77.5946] as [number, number]
        }
      };

      mockDocClient.send.mockResolvedValueOnce({});

      const result = await authService.registerUser(userData);

      expect(result).toMatchObject({
        id: 'test-uuid',
        ...userData,
        verificationStatus: 'pending'
      });

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'EkBharathEkMandi-Users',
            Item: expect.objectContaining({
              PK: 'USER#test-uuid',
              SK: 'PROFILE',
              GSI1PK: 'PHONE#+919876543210',
              GSI1SK: 'USER'
            })
          })
        })
      );
    });
  });

  describe('getUserByPhone', () => {
    it('should return user if found', async () => {
      const mockUser = {
        id: 'test-user-id',
        phone: '+919876543210',
        name: 'Test User',
        userType: 'vendor'
      };

      mockDocClient.send.mockResolvedValueOnce({ Item: mockUser });

      const result = await authService.getUserByPhone('+919876543210');

      expect(result).toEqual(mockUser);
      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Key: {
              GSI1PK: 'PHONE#+919876543210',
              GSI1SK: 'USER'
            },
            IndexName: 'GSI1'
          })
        })
      );
    });

    it('should return null if user not found', async () => {
      mockDocClient.send.mockResolvedValueOnce({ Item: undefined });

      const result = await authService.getUserByPhone('+919876543210');

      expect(result).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid JWT token', () => {
      const payload = { userId: 'test-user', phone: '+919876543210' };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret');

      const result = authService.verifyToken(token);

      expect(result.userId).toBe('test-user');
      expect(result.phone).toBe('+919876543210');
    });

    it('should throw error for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow('Invalid token');
    });
  });

  describe('hasRole', () => {
    it('should return true if user has allowed role', () => {
      const result = authService.hasRole('vendor', ['vendor', 'admin']);
      expect(result).toBe(true);
    });

    it('should return false if user does not have allowed role', () => {
      const result = authService.hasRole('b2c_buyer', ['vendor', 'admin']);
      expect(result).toBe(false);
    });
  });
});