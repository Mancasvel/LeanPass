'use client';

import FileUpload from '@/components/FileUpload';
import StudyGuideResults from '@/components/StudyGuideResults';
import ErrorMessage from '@/components/ErrorMessage';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const { result } = useAppStore();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 LeanPass
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sube tus exámenes antiguos y genera una guía de estudio personalizada 
            con IA para optimizar tu preparación
          </p>
        </div>

        {/* Error Message */}
        <ErrorMessage />

        {/* Main Content */}
        {!result ? (
          <div className="space-y-8">
            {/* Upload Section */}
            <FileUpload />
            
            {/* Features Section */}
            <div className="max-w-4xl mx-auto mt-16">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                ¿Cómo funciona?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Sube tu examen</h3>
                  <p className="text-gray-600">Arrastra o selecciona archivos PDF o TXT de exámenes anteriores</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. IA analiza</h3>
                  <p className="text-gray-600">Nuestro sistema identifica temas, frecuencia y dificultad automáticamente</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Recibe tu guía</h3>
                  <p className="text-gray-600">Obtén una guía personalizada con orden de estudio y consejos</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <StudyGuideResults />
        )}
      </div>
    </main>
  );
}
