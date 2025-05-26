import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudyGuide from '@/models/StudyGuide';
import { withAuth } from '@/middleware/auth';
import mongoose from 'mongoose';

// GET /api/study-guides/[id] - Obtener guía de estudio específica
export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid study guide ID' },
        { status: 400 }
      );
    }

    const studyGuide = await StudyGuide.findOne({
      _id: id,
      userId: user._id
    })
    .populate('examId', 'title originalFileName createdAt')
    .populate('subjectId', 'name description')
    .lean();

    if (!studyGuide) {
      return NextResponse.json(
        { success: false, error: 'Study guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: studyGuide
    });

  } catch (error: any) {
    console.error('Get study guide error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/study-guides/[id] - Eliminar guía de estudio
export const DELETE = withAuth(async (request: NextRequest, user: any, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid study guide ID' },
        { status: 400 }
      );
    }

    const studyGuide = await StudyGuide.findOneAndDelete({
      _id: id,
      userId: user._id
    });

    if (!studyGuide) {
      return NextResponse.json(
        { success: false, error: 'Study guide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Study guide deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete study guide error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 