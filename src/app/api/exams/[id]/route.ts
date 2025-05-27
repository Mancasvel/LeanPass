import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import StudyGuide from '@/models/StudyGuide';
import { withAuth } from '@/middleware/auth';
import mongoose from 'mongoose';

// GET /api/exams/[id] - Obtener examen específico
export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exam ID' },
        { status: 400 }
      );
    }

    const exam = await Exam.findOne({
      _id: id,
      userId: user._id
    }).populate('subjectId', 'name description').lean();

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam
    });

  } catch (error: any) {
    console.error('Get exam error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/exams/[id] - Actualizar examen
export const PUT = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exam ID' },
        { status: 400 }
      );
    }

    const { title } = await request.json();

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Exam title is required' },
        { status: 400 }
      );
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: id, userId: user._id },
      { title: title.trim() },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name description');

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exam.toJSON()
    });

  } catch (error: any) {
    console.error('Update exam error:', error);
    
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

// DELETE /api/exams/[id] - Eliminar examen
export const DELETE = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exam ID' },
        { status: 400 }
      );
    }

    // Verificar que el examen existe y pertenece al usuario
    const exam = await Exam.findOne({
      _id: id,
      userId: user._id
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Eliminar la guía de estudio asociada si existe
    await StudyGuide.deleteOne({ examId: id, userId: user._id });
    
    // Eliminar el examen
    await Exam.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Exam and associated study guide deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete exam error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 