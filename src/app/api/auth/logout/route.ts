import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Crear respuesta exitosa
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Limpiar la cookie de autenticación
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expira inmediatamente
    });

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 