// Mock auth service for development without AWS
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, OTPSession } from './auth';

// In-memory storage for development
let mockUsers: User[] = [];
let mockOTPSessions: OTPSession[] = [];

export class MockAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_OTP_ATTEMPTS = 3;

  async sendOTP(phone: string): Promise<{ sessionId: string; message: string }> {
    const otp = '123456'; // Fixed OTP for development
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const otpSession: OTPSession = {
      sessionId,
      phone,
      otp: await bcrypt.hash(otp, 10),
      expiresAt,
      attempts: 0,
      verified: false
    };

    mockOTPSessions.push(otpSession);

    // Log OTP for development
    console.log(`🔐 Development OTP for ${phone}: ${otp}`);

    return {
      sessionId,
      message: `OTP sent to ${phone}. For development, use: ${otp}`
    };
  }

  async verifyOTP(sessionId: string, otp: string): Promise<{ token: string; user?: User }> {
    const otpSession = mockOTPSessions.find(s => s.sessionId === sessionId);
    if (!otpSession) {
      throw new Error('Invalid or expired OTP session');
    }

    if (new Date() > new Date(otpSession.expiresAt)) {
      throw new Error('OTP has expired');
    }

    if (otpSession.attempts >= this.MAX_OTP_ATTEMPTS) {
      throw new Error('Maximum OTP attempts exceeded');
    }

    const isValidOTP = await bcrypt.compare(otp, otpSession.otp);
    if (!isValidOTP) {
      otpSession.attempts++;
      throw new Error('Invalid OTP');
    }

    otpSession.verified = true;
    const existingUser = await this.getUserByPhone(otpSession.phone);

    const tokenPayload = {
      sessionId,
      phone: otpSession.phone,
      userId: existingUser?.id,
      verified: true
    };

    const token = jwt.sign(tokenPayload, this.JWT_SECRET, { expiresIn: '24h' });

    return { token, user: existingUser };
  }

  async registerUser(userData: {
    phone: string;
    name: string;
    email?: string;
    userType: 'vendor' | 'b2b_buyer' | 'b2c_buyer';
    languages: string[];
    location: { state: string; district: string; coordinates: [number, number] };
  }): Promise<User> {
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user: User = {
      id: userId,
      ...userData,
      verificationStatus: 'pending',
      createdAt: now,
      updatedAt: now
    };

    mockUsers.push(user);
    return user;
  }
  async getUserByPhone(phone: string): Promise<User | null> {
    return mockUsers.find(u => u.phone === phone) || null;
  }

  async getUserById(userId: string): Promise<User | null> {
    return mockUsers.find(u => u.id === userId) || null;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error('User not found');
    }

    mockUsers[index] = {
      ...mockUsers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return mockUsers[index];
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  hasRole(userType: string, allowedRoles: string[]): boolean {
    return allowedRoles.includes(userType);
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, this.JWT_SECRET, { expiresIn: '7d' });
  }

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

export const mockAuthService = new MockAuthService();

// Add some sample users for development
mockAuthService.registerUser({
  phone: '+919876543210',
  name: 'Ravi Kumar',
  userType: 'vendor',
  languages: ['ta', 'en'],
  location: {
    state: 'Tamil Nadu',
    district: 'Chennai',
    coordinates: [13.0827, 80.2707]
  }
});

mockAuthService.registerUser({
  phone: '+919876543211',
  name: 'Priya Sharma',
  userType: 'b2b_buyer',
  languages: ['hi', 'en'],
  location: {
    state: 'Delhi',
    district: 'New Delhi',
    coordinates: [28.6139, 77.2090]
  }
});