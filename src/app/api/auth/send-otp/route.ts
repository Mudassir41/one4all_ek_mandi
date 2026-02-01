import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone number
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Basic phone number validation (Indian format)
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +91XXXXXXXXXX' },
        { status: 400 }
      );
    }

    const result = await authService.sendOTP(phone);

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      message: result.message
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}