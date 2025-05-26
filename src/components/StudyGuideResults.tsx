'use client';

import { useAppStore } from '@/store/useAppStore';
import { StudyTopic, QuestionExample, StudyResource } from '@/types';
import { useState } from 'react';

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

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
}

function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

interface ResourceCardProps {
  resource: StudyResource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const getResourceIcon = (tipo: string) => {
    switch (tipo) {
      case 'youtube':
        return '🎥';
      case 'web':
        return '🌐';
      case 'documento':
        return '📄';
      default:
        return '📚';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{getResourceIcon(resource.tipo)}</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{resource.titulo}</h4>
          <p className="text-sm text-gray-600 mt-1">{resource.descripcion}</p>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
          >
            Ver recurso →
          </a>
        </div>
      </div>
      
      {resource.tipo === 'youtube' && resource.youtube_id && (
        <YouTubeEmbed videoId={resource.youtube_id} title={resource.titulo} />
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: QuestionExample;
  index: number;
}

function QuestionCard({ question, index }: QuestionCardProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-blue-900">
          Pregunta {index + 1} ({question.tipo})
        </h4>
        <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(question.dificultad)}`}>
          {getDifficultyText(question.dificultad)}
        </span>
      </div>
      
      <p className="text-gray-800">{question.pregunta}</p>
      
      <button
        onClick={() => setShowSolution(!showSolution)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
      >
        {showSolution ? 'Ocultar solución' : 'Ver solución paso a paso'}
      </button>
      
      {showSolution && (
        <div className="space-y-4 mt-4 border-t border-blue-200 pt-4">
          <div>
            <h5 className="font-medium text-blue-900 mb-2">Solución paso a paso:</h5>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {question.solucion_paso_a_paso.map((paso, i) => (
                <li key={i}>{paso}</li>
              ))}
            </ol>
          </div>
          
          {question.variaciones.length > 0 && (
            <div>
              <h5 className="font-medium text-blue-900 mb-2">Posibles variaciones:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {question.variaciones.map((variacion, i) => (
                  <li key={i}>{variacion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {question.casos_atipicos.length > 0 && (
            <div>
              <h5 className="font-medium text-blue-900 mb-2">Casos atípicos:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {question.casos_atipicos.map((caso, i) => (
                  <li key={i}>{caso}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TopicCardProps {
  topic: StudyTopic;
}

function TopicCard({ topic }: TopicCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'guide' | 'questions' | 'resources'>('overview');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📋' },
    { id: 'guide', label: 'Guía', icon: '📖' },
    { id: 'questions', label: 'Preguntas', icon: '❓' },
    { id: 'resources', label: 'Recursos', icon: '🎯' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{topic.tema}</h3>
            <div className="flex items-center space-x-4 text-blue-100">
              <span className="flex items-center space-x-1">
                <span>Orden:</span>
                <span className="bg-blue-500 px-2 py-1 rounded-full text-xs font-medium">
                  #{topic.orden_estudio}
                </span>
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium bg-white ${getDifficultyColor(topic.dificultad).replace('bg-', 'text-').replace('text-', 'text-')}`}>
            {getDifficultyText(topic.dificultad)}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Frecuencia en examen</span>
              <span className="text-sm">{topic.frecuencia}/5</span>
            </div>
            <div className="flex space-x-1">
              {getFrequencyBars(topic.frecuencia)}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium block mb-2">Tipos de preguntas:</span>
            <div className="flex flex-wrap gap-2">
              {topic.tipo_preguntas.map((tipo, index) => (
                <span
                  key={index}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                >
                  {tipo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <p className="text-gray-700">{topic.guia_resolucion?.descripcion_general}</p>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">📚 Metodología de estudio</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {topic.guia_resolucion?.metodologia_estudio?.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🔑 Conceptos clave</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {topic.guia_resolucion?.conceptos_clave?.map((concepto, i) => (
                  <li key={i}>{concepto}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">⚠️ Errores comunes</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700 bg-red-50 p-3 rounded-lg">
                {topic.guia_resolucion?.errores_comunes?.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Preguntas de ejemplo ({topic.preguntas_ejemplo?.length || 0})
            </h4>
            {topic.preguntas_ejemplo?.map((question, index) => (
              <QuestionCard key={index} question={question} index={index} />
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">
              Recursos de estudio ({topic.recursos?.length || 0})
            </h4>
            {topic.recursos?.map((resource, index) => (
              <ResourceCard key={index} resource={resource} />
            ))}
          </div>
        )}
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
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            📚 Guía de Estudio Completa
          </h2>
          <p className="text-gray-600 mt-2">
            {result.totalTopics} temas identificados con guías detalladas, preguntas de ejemplo y recursos multimedia
          </p>
        </div>
        <button
          onClick={reset}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          🔄 Nuevo Análisis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {result.topics.map((topic, index) => (
          <TopicCard key={index} topic={topic} />
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          💡 Cómo usar esta guía de estudio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">📋 Resumen</h4>
            <ul className="space-y-1 text-sm">
              <li>• Vista general del tema y su importancia</li>
              <li>• Frecuencia y dificultad estimada</li>
              <li>• Tipos de preguntas más comunes</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">📖 Guía</h4>
            <ul className="space-y-1 text-sm">
              <li>• Metodología paso a paso para estudiar</li>
              <li>• Conceptos clave que debes dominar</li>
              <li>• Errores comunes que debes evitar</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">❓ Preguntas</h4>
            <ul className="space-y-1 text-sm">
              <li>• Ejemplos reales con soluciones detalladas</li>
              <li>• Variaciones y casos atípicos</li>
              <li>• Práctica paso a paso</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🎯 Recursos</h4>
            <ul className="space-y-1 text-sm">
              <li>• Videos de YouTube integrados</li>
              <li>• Enlaces a sitios web educativos</li>
              <li>• Documentación y referencias</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 