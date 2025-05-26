'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StudyGuideResults from '@/components/StudyGuideResults';
import { useAppStore } from '@/store/useAppStore';
import { StudyTopic } from '@/types';

interface StudyGuideData {
  topics: StudyTopic[];
  totalTopics: number;
  processingTime: number;
}

export default function GuiaPage() {
  const params = useParams();
  const router = useRouter();
  const { setResult } = useAppStore();
  const [guideData, setGuideData] = useState<StudyGuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideInfo, setGuideInfo] = useState<any>(null);

  useEffect(() => {
    if (params.id) {
      loadStudyGuide(params.id as string);
    }
  }, [params.id]);

  const loadStudyGuide = async (guideId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/study-guides/${guideId}`, {
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        const guide = data.data;
        setGuideInfo(guide);
        
        // Formatear los datos para StudyGuideResults
        const formattedResult = {
          topics: guide.topics.map((topic: any) => ({
            tema: topic.topicName || 'Sin título',
            frecuencia: topic.frecuencia || 1,
            dificultad: topic.dificultad || 1,
            tipo_preguntas: topic.tipoPreguntas || [],
            orden_estudio: topic.ordenEstudio || 1,
            guia_resolucion: {
              descripcion_general: topic.guiaResolucion?.descripcionGeneral || '',
              metodologia_estudio: topic.guiaResolucion?.metodologiaEstudio || [],
              conceptos_clave: topic.guiaResolucion?.conceptosClave || [],
              errores_comunes: topic.guiaResolucion?.erroresComunes || []
            },
            preguntas_ejemplo: (topic.sampleQuestions || []).map((example: any) => ({
              pregunta: example.question || '',
              tipo: example.tipo || 'general',
              dificultad: example.dificultad || 1,
              solucion_paso_a_paso: example.stepByStepSolution || [],
              variaciones: example.variations || [],
              casos_atipicos: example.atypicalCases || []
            })),
            recursos: (topic.resources || []).map((resource: any) => ({
              titulo: resource.title || '',
              url: resource.url || '',
              tipo: resource.type || 'web',
              descripcion: resource.description || '',
              youtube_id: resource.youtubeId
            }))
          })),
          totalTopics: guide.totalTopics || guide.topics?.length || 0,
          processingTime: guide.processingTime
        };
        
        setGuideData(formattedResult);
        setResult(formattedResult);
        setError(null);
      } else {
        setError(data.error || 'Error al cargar la guía de estudio');
      }
    } catch (err) {
      console.error('Error loading study guide:', err);
      setError('Error al cargar la guía de estudio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando guía de estudio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!guideData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No se encontró la guía de estudio</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con información de la guía */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
              >
                ← Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {guideInfo?.examId?.title || 'Guía de Estudio'}
              </h1>
              <p className="text-gray-600">
                {guideInfo?.subjectId?.name} • {guideData.totalTopics} temas analizados
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Creado: {guideInfo?.createdAt ? new Date(guideInfo.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                Modelo: Nvidia Llama 3.1 Nemotron Ultra
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de la guía */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <StudyGuideResults />
      </div>
    </div>
  );
} 