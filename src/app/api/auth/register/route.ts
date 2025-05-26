import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, name } = await request.json();

    // Validaciones básicas
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Crear nuevo usuario
    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password, // Se hasheará automáticamente en el pre-save hook
      name: name.trim()
    });

    await user.save();

    // Generar token JWT
    const token = generateToken(user._id.toString());

    // Crear respuesta con cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    }, { status: 201 });

    // Establecer cookie httpOnly
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 días
    });

    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 