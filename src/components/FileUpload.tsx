'use client';

import { useCallback, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FileUploadResponse } from '@/types';

export default function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const { isUploading, isAnalyzing, setUploading, setAnalyzing, setError, setResult } = useAppStore();

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no soportado. Solo se permiten archivos PDF y TXT.');
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Paso 1: Crear una asignatura temporal para el archivo
      const subjectResponse = await fetch('/api/subjects', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Análisis Rápido ${Date.now()}`,
          description: 'Asignatura temporal para análisis directo de archivos'
        })
      });

      const subjectData = await subjectResponse.json();
      if (!subjectData.success) {
        throw new Error(subjectData.error || 'Error creando asignatura temporal');
      }

      const subjectId = subjectData.data._id;

      // Paso 2: Subir el archivo como examen
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', subjectId);
      formData.append('title', file.name.replace(/\.[^/.]+$/, "")); // Nombre sin extensión

      const uploadResponse = await fetch('/api/exams', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Error subiendo archivo');
      }

      const examId = uploadResult.data._id;
      setUploading(false);
      setAnalyzing(true);

      // Paso 3: Analizar el examen
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ examId })
      });

      const analyzeResult: FileUploadResponse = await analyzeResponse.json();

      if (analyzeResult.success && analyzeResult.data) {
        setResult(analyzeResult.data);
      } else {
        setError(analyzeResult.error || 'Error al procesar el archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, [setUploading, setAnalyzing, setError, setResult]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const isProcessing = isUploading || isAnalyzing;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.txt"
          disabled={isProcessing}
        />
        
        <div className="space-y-4">
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  {isAnalyzing ? 'Analizando contenido...' : 'Subiendo archivo...'}
                </p>
                <p className="text-sm text-gray-500">
                  Esto puede tomar unos momentos
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg
                  className="h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-gray-900">
                    Arrastra tu examen aquí
                  </span>
                  <span className="text-blue-600"> o haz clic para seleccionar</span>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Archivos PDF o TXT (máximo 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 