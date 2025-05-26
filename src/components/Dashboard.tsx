'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

interface Subject {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface Exam {
  _id: string;
  title: string;
  originalFileName: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: string;
  subjectId: {
    _id: string;
    name: string;
  };
}

interface StudyGuide {
  _id: string;
  totalTopics: number;
  createdAt: string;
  examId: {
    _id: string;
    title: string;
  };
  subjectId: {
    _id: string;
    name: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subjects' | 'exams' | 'guides'>('subjects');

  // Estados para formularios
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });
  const [newExam, setNewExam] = useState({ title: '', file: null as File | null });

  const { setResult } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const requestOptions = {
        credentials: 'include' as RequestCredentials,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Cargar asignaturas
      const subjectsRes = await fetch('/api/subjects', requestOptions);
      const subjectsData = await subjectsRes.json();
      
      if (subjectsData.success) {
        setSubjects(subjectsData.data);
      } else {
        setError(subjectsData.error || 'Error loading subjects');
      }

      // Cargar exámenes
      const examsRes = await fetch('/api/exams', requestOptions);
      const examsData = await examsRes.json();
      
      if (examsData.success) {
        setExams(examsData.data);
      } else {
        setError(examsData.error || 'Error loading exams');
      }

      // Cargar guías de estudio
      const guidesRes = await fetch('/api/study-guides', requestOptions);
      const guidesData = await guidesRes.json();
      
      if (guidesData.success) {
        setStudyGuides(guidesData.data);
      } else {
        setError(guidesData.error || 'Error loading study guides');
      }

    } catch (err) {
      setError('Error loading data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSubject = async () => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSubject)
      });

      const data = await response.json();
      
      if (data.success) {
        setSubjects([data.data, ...subjects]);
        setNewSubject({ name: '', description: '' });
        setShowSubjectForm(false);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error creating subject');
    }
  };

  const uploadExam = async () => {
    try {
      if (!newExam.file || !selectedSubject) {
        setError('Please select a file and subject');
        return;
      }

      const formData = new FormData();
      formData.append('file', newExam.file);
      formData.append('title', newExam.title);
      formData.append('subjectId', selectedSubject);

      const response = await fetch('/api/exams', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setExams([data.data, ...exams]);
        setNewExam({ title: '', file: null });
        setShowExamForm(false);
        setError(null);
        
        // Iniciar análisis automáticamente
        analyzeExam(data.data._id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error uploading exam');
    }
  };

  const analyzeExam = async (examId: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ examId })
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar el estado del examen
        setExams(exams.map(exam => 
          exam._id === examId 
            ? { ...exam, analysisStatus: 'completed' as const }
            : exam
        ));
        
        // Recargar guías de estudio
        await loadData();
        
        // Buscar la guía de estudio recién creada y mostrarla automáticamente
        try {
          const guidesResponse = await fetch('/api/study-guides', {
            credentials: 'include'
          });
          const guidesData = await guidesResponse.json();
          
          if (guidesData.success) {
            // Buscar la guía que corresponde a este examen
            const newGuide = guidesData.data.find((guide: StudyGuide) => guide.examId._id === examId);
            if (newGuide) {
              // Navegar automáticamente a la guía
              router.push(`/guia/${newGuide._id}`);
            }
          }
        } catch (err) {
          console.error('Error loading new study guide:', err);
        }
        
        setError(null);
      } else {
        setError(data.error);
        // Marcar como error
        setExams(exams.map(exam => 
          exam._id === examId 
            ? { ...exam, analysisStatus: 'error' as const }
            : exam
        ));
      }
    } catch (err) {
      setError('Error analyzing exam');
      setExams(exams.map(exam => 
        exam._id === examId 
          ? { ...exam, analysisStatus: 'error' as const }
          : exam
      ));
    }
  };

  const deleteSubject = async (subjectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignatura? Esto también eliminará todos los exámenes y guías asociados.')) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setSubjects(subjects.filter(s => s._id !== subjectId));
        setExams(exams.filter(e => e.subjectId._id !== subjectId));
        setStudyGuides(studyGuides.filter(g => g.subjectId._id !== subjectId));
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error deleting subject');
    }
  };

  const deleteExam = async (examId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este examen? Esto también eliminará las guías de estudio asociadas.')) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        setExams(exams.filter(e => e._id !== examId));
        setStudyGuides(studyGuides.filter(g => g.examId._id !== examId));
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error deleting exam');
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando';
      case 'error': return 'Error';
      default: return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - LeanPass</h1>
          <p className="text-gray-600 mt-2">Gestiona tus asignaturas, exámenes y guías de estudio</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'subjects', label: 'Asignaturas', count: subjects.length },
                { id: 'exams', label: 'Exámenes', count: exams.length },
                { id: 'guides', label: 'Guías de Estudio', count: studyGuides.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'subjects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Asignaturas</h2>
              <button
                onClick={() => setShowSubjectForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Nueva Asignatura
              </button>
            </div>

            {showSubjectForm && (
              <div className="mb-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Crear Nueva Asignatura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre de la asignatura"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Descripción (opcional)"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={createSubject}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => setShowSubjectForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div key={subject._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                  <p className="text-gray-600 mb-4">{subject.description || 'Sin descripción'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSubject(subject._id);
                          setActiveTab('exams');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver Exámenes
                      </button>
                      <button
                        onClick={() => deleteSubject(subject._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'exams' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Exámenes</h2>
              <button
                onClick={() => setShowExamForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Subir Examen
              </button>
            </div>

            {showExamForm && (
              <div className="mb-6 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Subir Nuevo Examen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Título del examen"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <select
                    value={selectedSubject || ''}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Seleccionar asignatura</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setNewExam({...newExam, file: e.target.files?.[0] || null})}
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={uploadExam}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Subir y Analizar
                  </button>
                  <button
                    onClick={() => setShowExamForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div key={exam._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{exam.title}</h3>
                  <p className="text-gray-600 mb-2">{exam.subjectId.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{exam.originalFileName}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.analysisStatus)}`}>
                      {getStatusText(exam.analysisStatus)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    {exam.analysisStatus === 'completed' && (
                      <button
                        onClick={() => {
                          // Buscar la guía correspondiente a este examen
                          const guide = studyGuides.find(g => g.examId._id === exam._id);
                          if (guide) {
                            router.push(`/guia/${guide._id}`);
                          }
                        }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Ver Guía
                      </button>
                    )}
                    {exam.analysisStatus === 'pending' && (
                      <button
                        onClick={() => analyzeExam(exam._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Analizar
                      </button>
                    )}
                    <button
                      onClick={() => deleteExam(exam._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guides' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Guías de Estudio</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyGuides.map((guide) => (
                <div key={guide._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{guide.examId.title}</h3>
                  <p className="text-gray-600 mb-2">{guide.subjectId.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{guide.totalTopics} temas analizados</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(guide.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => router.push(`/guia/${guide._id}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver Guía
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 