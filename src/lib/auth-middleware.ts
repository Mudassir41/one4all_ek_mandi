import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/services';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    phone: string;
    userType: string;
    verified: boolean;
  };
}

/**
 * Authentication middleware for API routes
 */
export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const decoded = authService.verifyToken(token);
      
      // Add user info to request
      (request as AuthenticatedRequest).user = {
        id: decoded.userId,
        phone: decoded.phone,
        userType: decoded.userType,
        verified: decoded.verified
      };

      return await handler(request as AuthenticatedRequest);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
  };
}

/**
 * Role-based authorization middleware
 */
export function withRole(allowedRoles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest): Promise<NextResponse> => {
      const user = request.user!;
      
      if (!authService.hasRole(user.userType, allowedRoles)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return await handler(request);
    });
  };
}

/**
 * Extract user from token without requiring authentication
 */
export async function getOptionalUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    const decoded = authService.verifyToken(token);
    return {
      id: decoded.userId,
      phone: decoded.phone,
      userType: decoded.userType,
      verified: decoded.verified
    };
  } catch {
    return null;
  }
}