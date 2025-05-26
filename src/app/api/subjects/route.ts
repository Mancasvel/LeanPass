import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';
import { withAuth } from '@/middleware/auth';

// GET /api/subjects - Listar asignaturas del usuario
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const subjects = await Subject.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: subjects
    });

  } catch (error: any) {
    console.error('Get subjects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/subjects - Crear nueva asignatura
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { name, description } = await request.json();

    // Validaciones básicas
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subject name is required' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una asignatura con el mismo nombre para este usuario
    const existingSubject = await Subject.findOne({
      userId: user._id,
      name: name.trim()
    });

    if (existingSubject) {
      return NextResponse.json(
        { success: false, error: 'A subject with this name already exists' },
        { status: 409 }
      );
    }

    // Crear nueva asignatura
    const subject = new Subject({
      userId: user._id,
      name: name.trim(),
      description: description?.trim() || ''
    });

    await subject.save();

    return NextResponse.json({
      success: true,
      data: subject.toJSON()
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create subject error:', error);
    
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
}); 