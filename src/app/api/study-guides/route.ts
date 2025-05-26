import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudyGuide from '@/models/StudyGuide';
import { withAuth } from '@/middleware/auth';

// GET /api/study-guides - Listar guías de estudio del usuario
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    // Construir filtro
    const filter: any = { userId: user._id };
    
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const studyGuides = await StudyGuide.find(filter)
      .populate('examId', 'title originalFileName createdAt')
      .populate('subjectId', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: studyGuides
    });

  } catch (error: any) {
    console.error('Get study guides error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 