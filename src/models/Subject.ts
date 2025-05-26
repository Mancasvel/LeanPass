import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    maxlength: [100, 'Subject name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
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
SubjectSchema.index({ userId: 1, name: 1 }, { unique: true }); // Un usuario no puede tener dos asignaturas con el mismo nombre
SubjectSchema.index({ userId: 1, createdAt: -1 }); // Para listar asignaturas por usuario ordenadas por fecha

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema); 