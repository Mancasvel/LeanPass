export interface StudyTopic {
  tema: string;
  frecuencia: number;
  dificultad: number;
  tipo_preguntas: string[];
  orden_estudio: number;
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