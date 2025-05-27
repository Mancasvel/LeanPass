import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subject from '@/models/Subject';
import Exam from '@/models/Exam';
import StudyGuide from '@/models/StudyGuide';
import { withAuth } from '@/middleware/auth';
import mongoose from 'mongoose';

// GET /api/subjects/[id] - Obtener asignatura específica
export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const subject = await Subject.findOne({
      _id: id,
      userId: user._id
    }).lean();

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subject
    });

  } catch (error: any) {
    console.error('Get subject error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/subjects/[id] - Actualizar asignatura
export const PUT = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    const { name, description } = await request.json();

    // Validaciones básicas
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subject name is required' },
        { status: 400 }
      );
    }

    // Verificar si ya existe otra asignatura con el mismo nombre para este usuario
    const existingSubject = await Subject.findOne({
      userId: user._id,
      name: name.trim(),
      _id: { $ne: id }
    });

    if (existingSubject) {
      return NextResponse.json(
        { success: false, error: 'A subject with this name already exists' },
        { status: 409 }
      );
    }

    // Actualizar asignatura
    const subject = await Subject.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        name: name.trim(),
        description: description?.trim() || ''
      },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subject.toJSON()
    });

  } catch (error: any) {
    console.error('Update subject error:', error);
    
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

// DELETE /api/subjects/[id] - Eliminar asignatura
export const DELETE = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Verificar que la asignatura existe y pertenece al usuario
    const subject = await Subject.findOne({
      _id: id,
      userId: user._id
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Eliminar en cascada: guías de estudio, exámenes y la asignatura
    await StudyGuide.deleteMany({ subjectId: id, userId: user._id });
    await Exam.deleteMany({ subjectId: id, userId: user._id });
    await Subject.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Subject and all related data deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete subject error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 