import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validate required fields
    const requiredFields = ['phone', 'name', 'userType', 'languages', 'location'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate user type
    const validUserTypes = ['vendor', 'b2b_buyer', 'b2c_buyer'];
    if (!validUserTypes.includes(userData.userType)) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Validate languages array
    if (!Array.isArray(userData.languages) || userData.languages.length === 0) {
      return NextResponse.json(
        { error: 'At least one language must be specified' },
        { status: 400 }
      );
    }

    // Validate location structure
    if (!userData.location.state || !userData.location.district || !userData.location.coordinates) {
      return NextResponse.json(
        { error: 'Complete location information is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await authService.getUserByPhone(userData.phone);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    const user = await authService.registerUser(userData);

    return NextResponse.json({
      success: true,
      user,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register user error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}