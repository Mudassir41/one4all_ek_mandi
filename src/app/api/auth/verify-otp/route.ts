import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, otp } = await request.json();

    // Validate input
    if (!sessionId || !otp) {
      return NextResponse.json(
        { error: 'Session ID and OTP are required' },
        { status: 400 }
      );
    }

    if (typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    const result = await authService.verifyOTP(sessionId, otp);

    // Set HTTP-only cookie for token
    const response = NextResponse.json({
      success: true,
      user: result.user,
      isNewUser: !result.user
    });

    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify OTP' },
      { status: 400 }
    );
  }
}