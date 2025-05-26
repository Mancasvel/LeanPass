import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  _id: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'txt';
  analysisStatus: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  fileSize: number;
  originalFileName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>({
  subjectId: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required'],
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileType: {
    type: String,
    enum: ['pdf', 'txt'],
    required: [true, 'File type is required']
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending',
    index: true
  },
  errorMessage: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0']
  },
  originalFileName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Índices compuestos para optimizar consultas
ExamSchema.index({ userId: 1, subjectId: 1, createdAt: -1 }); // Para listar exámenes por usuario y asignatura
ExamSchema.index({ analysisStatus: 1, createdAt: 1 }); // Para procesar exámenes pendientes
ExamSchema.index({ userId: 1, analysisStatus: 1 }); // Para dashboard del usuario

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema); 