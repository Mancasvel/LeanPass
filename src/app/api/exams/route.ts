import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import Subject from '@/models/Subject';
import { withAuth } from '@/middleware/auth';

// GET /api/exams - Listar exámenes del usuario (con filtro opcional por asignatura)
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const status = searchParams.get('status');

    // Construir filtro
    const filter: any = { userId: user._id };
    
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    
    if (status) {
      filter.analysisStatus = status;
    }

    const exams = await Exam.find(filter)
      .populate('subjectId', 'name description')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: exams
    });

  } catch (error: any) {
    console.error('Get exams error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/exams - Crear nuevo examen (subir archivo)
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subjectId = formData.get('subjectId') as string;
    const title = formData.get('title') as string;

    // Validaciones básicas
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Exam title is required' },
        { status: 400 }
      );
    }

    // Verificar que la asignatura existe y pertenece al usuario
    const subject = await Subject.findOne({
      _id: subjectId,
      userId: user._id
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Verificar tipo de archivo
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only PDF and TXT files are supported' },
        { status: 400 }
      );
    }

    // Verificar tamaño del archivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size cannot exceed 10MB' },
        { status: 400 }
      );
    }

    // Por ahora, guardamos el archivo en memoria y lo procesamos directamente
    // En producción, deberías subir a S3, Supabase Storage, etc.
    const buffer = await file.arrayBuffer();
    const fileUrl = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

    // Crear registro del examen
    const exam = new Exam({
      subjectId,
      userId: user._id,
      title: title.trim(),
      fileUrl,
      fileType: file.type === 'application/pdf' ? 'pdf' : 'txt',
      analysisStatus: 'pending',
      fileSize: file.size,
      originalFileName: file.name
    });

    await exam.save();

    // Poblar la información de la asignatura para la respuesta
    await exam.populate('subjectId', 'name description');

    return NextResponse.json({
      success: true,
      data: exam.toJSON()
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create exam error:', error);
    
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