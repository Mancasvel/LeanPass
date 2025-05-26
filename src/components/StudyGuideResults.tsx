'use client';

import { useAppStore } from '@/store/useAppStore';
import { StudyTopic } from '@/types';

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 2) return 'bg-green-100 text-green-800';
  if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
  if (difficulty <= 4) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getDifficultyText = (difficulty: number) => {
  if (difficulty <= 2) return 'Fácil';
  if (difficulty <= 3) return 'Medio';
  if (difficulty <= 4) return 'Difícil';
  return 'Muy Difícil';
};

const getFrequencyBars = (frequency: number) => {
  const maxBars = 5;
  return Array.from({ length: maxBars }, (_, i) => (
    <div
      key={i}
      className={`h-2 w-4 rounded-sm ${
        i < frequency ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    />
  ));
};

interface TopicCardProps {
  topic: StudyTopic;
}

function TopicCard({ topic }: TopicCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {topic.tema}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <span className="font-medium">Orden:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                #{topic.orden_estudio}
              </span>
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.dificultad)}`}>
          {getDifficultyText(topic.dificultad)}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Frecuencia</span>
            <span className="text-sm text-gray-600">{topic.frecuencia}/5</span>
          </div>
          <div className="flex space-x-1">
            {getFrequencyBars(topic.frecuencia)}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700 block mb-2">
            Tipos de preguntas:
          </span>
          <div className="flex flex-wrap gap-2">
            {topic.tipo_preguntas.map((tipo, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {tipo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudyGuideResults() {
  const { result, reset } = useAppStore();

  if (!result) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Guía de Estudio Generada
          </h2>
          <p className="text-gray-600 mt-1">
            {result.totalTopics} temas identificados, ordenados por prioridad de estudio
          </p>
        </div>
        <button
          onClick={reset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nuevo Análisis
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result.topics.map((topic, index) => (
          <TopicCard key={index} topic={topic} />
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Consejos para estudiar
        </h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Sigue el orden de estudio sugerido para optimizar tu tiempo</li>
          <li>• Dedica más tiempo a los temas con mayor dificultad</li>
          <li>• Los temas con alta frecuencia son más probables en el examen</li>
          <li>• Practica diferentes tipos de preguntas para cada tema</li>
        </ul>
      </div>
    </div>
  );
} 