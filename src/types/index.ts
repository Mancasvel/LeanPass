export interface QuestionExample {
  pregunta: string;
  tipo: string;
  dificultad: number;
  solucion_paso_a_paso: string[];
  variaciones: string[];
  casos_atipicos: string[];
}

export interface StudyResource {
  titulo: string;
  url: string;
  tipo: 'web' | 'youtube' | 'documento';
  descripcion: string;
  youtube_id?: string; // Para videos de YouTube embedded
}

export interface StudyTopic {
  tema: string;
  frecuencia: number;
  dificultad: number;
  tipo_preguntas: string[];
  orden_estudio: number;
  guia_resolucion: {
    descripcion_general: string;
    metodologia_estudio: string[];
    conceptos_clave: string[];
    errores_comunes: string[];
  };
  preguntas_ejemplo: QuestionExample[];
  recursos: StudyResource[];
}

export interface AnalysisResult {
  topics: StudyTopic[];
  totalTopics: number;
  processingTime?: number;
}

export interface UploadState {
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export interface FileUploadResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
} 