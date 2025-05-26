import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function authenticateToken(request: NextRequest): Promise<{ user: any } | { error: string }> {
  try {
    // Primero intentar obtener el token de las cookies
    const cookieToken = request.cookies.get('authToken')?.value;
    
    // Si no hay cookie, intentar con el header Authorization
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    const token = cookieToken || headerToken;

    if (!token) {
      return { error: 'Access token required' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    await connectDB();
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return { error: 'User not found' };
    }

    return { user: user.toJSON() };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { error: 'Invalid token' };
  }
}

export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function withAuth(handler: (request: NextRequest, user: any, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await authenticateToken(request);
    
    if ('error' in authResult) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    return handler(request, authResult.user, context);
  };
} 