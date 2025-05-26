import { create } from 'zustand';
import { UploadState, AnalysisResult } from '@/types';

interface AppStore extends UploadState {
  setUploading: (isUploading: boolean) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: AnalysisResult | null) => void;
  reset: () => void;
}

const initialState: UploadState = {
  isUploading: false,
  isAnalyzing: false,
  error: null,
  result: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  setUploading: (isUploading) => set({ isUploading }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),
  setResult: (result) => set({ result }),
  reset: () => set(initialState),
})); 