import mongoose, { Document, Schema } from 'mongoose';

// Interfaces para subdocumentos
export interface ISampleQuestion {
  question: string;
  tipo: string;
  dificultad: number;
  stepByStepSolution: string[];
  variations: string[];
  atypicalCases: string[];
}

export interface IResource {
  type: 'youtube' | 'web' | 'documento';
  title: string;
  url: string;
  description: string;
  youtubeId?: string;
}

export interface ITopic {
  topicName: string;
  frecuencia: number;
  dificultad: number;
  tipoPreguntas: string[];
  ordenEstudio: number;
  guiaResolucion: {
    descripcionGeneral: string;
    metodologiaEstudio: string[];
    conceptosClave: string[];
    erroresComunes: string[];
  };
  sampleQuestions: ISampleQuestion[];
  resources: IResource[];
}

export interface IStudyGuide extends Document {
  _id: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topics: ITopic[];
  overallSummary: string;
  totalTopics: number;
  processingTime: number;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema para preguntas de ejemplo
const SampleQuestionSchema = new Schema<ISampleQuestion>({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  tipo: {
    type: String,
    required: [true, 'Question type is required'],
    trim: true
  },
  dificultad: {
    type: Number,
    required: [true, 'Difficulty is required'],
    min: 1,
    max: 5
  },
  stepByStepSolution: [{
    type: String,
    trim: true
  }],
  variations: [{
    type: String,
    trim: true
  }],
  atypicalCases: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Schema para recursos
const ResourceSchema = new Schema<IResource>({
  type: {
    type: String,
    enum: ['youtube', 'web', 'documento'],
    required: [true, 'Resource type is required']
  },
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  youtubeId: {
    type: String,
    trim: true,
    default: null
  }
}, { _id: false });

// Schema para temas
const TopicSchema = new Schema<ITopic>({
  topicName: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true,
    maxlength: [200, 'Topic name cannot exceed 200 characters']
  },
  frecuencia: {
    type: Number,
    required: [true, 'Frequency is required'],
    min: 1,
    max: 5
  },
  dificultad: {
    type: Number,
    required: [true, 'Difficulty is required'],
    min: 1,
    max: 5
  },
  tipoPreguntas: [{
    type: String,
    trim: true
  }],
  ordenEstudio: {
    type: Number,
    required: [true, 'Study order is required'],
    min: 1
  },
  guiaResolucion: {
    descripcionGeneral: {
      type: String,
      required: [true, 'General description is required'],
      trim: true
    },
    metodologiaEstudio: [{
      type: String,
      trim: true
    }],
    conceptosClave: [{
      type: String,
      trim: true
    }],
    erroresComunes: [{
      type: String,
      trim: true
    }]
  },
  sampleQuestions: [SampleQuestionSchema],
  resources: [ResourceSchema]
}, { _id: false });

// Schema principal de StudyGuide
const StudyGuideSchema = new Schema<IStudyGuide>({
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam ID is required'],
    unique: true, // Una guía por examen
    index: true
  },
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
  topics: {
    type: [TopicSchema],
    required: [true, 'Topics are required'],
    validate: {
      validator: function(topics: ITopic[]) {
        return topics.length > 0 && topics.length <= 15;
      },
      message: 'Must have between 1 and 15 topics'
    }
  },
  overallSummary: {
    type: String,
    required: [true, 'Overall summary is required'],
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  totalTopics: {
    type: Number,
    required: [true, 'Total topics count is required'],
    min: 1
  },
  processingTime: {
    type: Number,
    required: [true, 'Processing time is required'],
    min: 0
  },
  aiModel: {
    type: String,
    required: [true, 'AI model is required'],
    trim: true,
    default: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free'
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
StudyGuideSchema.index({ userId: 1, subjectId: 1, createdAt: -1 }); // Para listar guías por usuario y asignatura
StudyGuideSchema.index({ examId: 1 }); // Para buscar guía por examen específico
StudyGuideSchema.index({ userId: 1, createdAt: -1 }); // Para dashboard del usuario

export default mongoose.models.StudyGuide || mongoose.model<IStudyGuide>('StudyGuide', StudyGuideSchema); 