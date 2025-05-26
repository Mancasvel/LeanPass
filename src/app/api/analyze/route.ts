import { NextRequest, NextResponse } from 'next/server';
import { StudyTopic } from '@/types';
import connectDB from '@/lib/mongodb';
import Exam from '@/models/Exam';
import StudyGuide from '@/models/StudyGuide';
import { withAuth } from '@/middleware/auth';
import mongoose from 'mongoose';

// Importación dinámica de pdf-parse para evitar problemas de SSR
const getPdfParse = async () => {
  const pdfParse = await import('pdf-parse');
  return pdfParse.default;
};

// POST /api/analyze - Analizar archivo o examen existente
export const POST = withAuth(async (request: NextRequest, user: any) => {
  let requestBody: any = null;
  let examId: string | null = null;
  let isFileUpload = false;
  
  try {
    await connectDB();
    
    // Detectar si es FormData (file upload) o JSON (exam analysis)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Es un file upload directo - redirigir al endpoint correcto
      isFileUpload = true;
      return NextResponse.json(
        { success: false, error: 'Para subir archivos usa /api/exams' },
        { status: 400 }
      );
    } else {
      // Es JSON con examId
      const bodyText = await request.text();
      console.log('Raw request body:', bodyText);
      
      try {
        requestBody = JSON.parse(bodyText);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return NextResponse.json(
          { success: false, error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
      
      examId = requestBody.examId;
    }
    
    if (!examId) {
      return NextResponse.json(
        { success: false, error: 'Exam ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exam ID' },
        { status: 400 }
      );
    }

    // Buscar el examen y verificar que pertenece al usuario
    const exam = await Exam.findOne({
      _id: examId,
      userId: user._id
    }).populate('subjectId', 'name');

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Verificar si ya existe una guía de estudio para este examen
    const existingGuide = await StudyGuide.findOne({ examId });
    if (existingGuide) {
      return NextResponse.json({
        success: true,
        data: {
          topics: existingGuide.topics.map((topic: any) => ({
            tema: topic.topicName,
            frecuencia: topic.frecuencia,
            dificultad: topic.dificultad,
            tipo_preguntas: topic.tipoPreguntas,
            orden_estudio: topic.ordenEstudio,
            guia_resolucion: topic.guiaResolucion,
            preguntas_ejemplo: topic.sampleQuestions.map((q: any) => ({
              pregunta: q.question,
              tipo: q.tipo,
              dificultad: q.dificultad,
              solucion_paso_a_paso: q.stepByStepSolution,
              variaciones: q.variations,
              casos_atipicos: q.atypicalCases
            })),
            recursos: topic.resources
          })),
          totalTopics: existingGuide.totalTopics,
          processingTime: existingGuide.processingTime
        }
      });
    }

    // Marcar el examen como en procesamiento
    await Exam.findByIdAndUpdate(examId, { analysisStatus: 'processing' });

    let extractedText = '';

    // Extraer texto del archivo almacenado
    if (exam.fileType === 'pdf') {
      // Decodificar el archivo base64 y extraer texto
      const base64Data = exam.fileUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const pdfParse = await getPdfParse();
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (exam.fileType === 'txt') {
      // Decodificar el archivo base64 de texto
      const base64Data = exam.fileUrl.split(',')[1];
      extractedText = Buffer.from(base64Data, 'base64').toString('utf-8');
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: 'No se pudo extraer texto del archivo' },
        { status: 400 }
      );
    }

    // Con Nvidia Llama 3.1 Nemotron Ultra podemos procesar documentos completos sin chunking
    console.log(`Procesando documento completo con Nvidia Llama 3.1 Nemotron Ultra (${extractedText.length} caracteres)`);
    
    // Llamar a OpenRouter API con Nvidia Llama 3.1 Nemotron Ultra
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'LeanPass Study Guide Generator',
      },
      body: JSON.stringify({
        model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
        messages: [
          {
            role: 'user',
            content: `You are an academic analysis expert. Analyze the following exam content and create a comprehensive study guide with detailed resolution methods and resources.

EXAM CONTENT:
${extractedText}

Generate a JSON array with 8-12 topics from the exam. Each topic must have this EXACT structure:

{
  "tema": "Topic Name",
  "frecuencia": 4,
  "dificultad": 3,
  "tipo_preguntas": ["test", "desarrollo", "cálculo"],
  "orden_estudio": 1,
  "guia_resolucion": {
    "descripcion_general": "Brief description of the topic",
    "metodologia_estudio": ["Step 1", "Step 2", "Step 3"],
    "conceptos_clave": ["Key concept 1", "Key concept 2"],
    "errores_comunes": ["Common mistake 1", "Common mistake 2"]
  },
  "preguntas_ejemplo": [
    {
      "pregunta": "Example question text",
      "tipo": "desarrollo",
      "dificultad": 3,
      "solucion_paso_a_paso": ["Step 1", "Step 2", "Step 3"],
      "variaciones": ["Variation 1", "Variation 2"],
      "casos_atipicos": ["Edge case 1", "Edge case 2"]
    }
  ],
  "recursos": [
    {
      "titulo": "Resource title",
      "url": "https://example.com",
      "tipo": "web",
      "descripcion": "Resource description"
    },
    {
      "titulo": "YouTube Video Title",
      "url": "https://www.youtube.com/watch?v=VIDEO_ID",
      "tipo": "youtube",
      "descripcion": "Video description",
      "youtube_id": "VIDEO_ID"
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Include 2-3 example questions per topic with detailed step-by-step solutions
2. Provide real YouTube video IDs for educational content related to each topic
3. Include relevant web resources (Wikipedia, educational sites, documentation)
4. Make metodologia_estudio practical and actionable
5. Focus on common exam question patterns and solution approaches

Return ONLY a valid JSON array with this exact structure, no explanations, no markdown, no additional text.`
          }
        ],
        temperature: 0.3,
        max_tokens: 32000,
        top_p: 0.95,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error('OpenRouter API Error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Error al procesar con el LLM' },
        { status: 500 }
      );
    }

    // 1️⃣ Capturar respuesta cruda para diagnóstico
    const responseText = await openRouterResponse.text();
    console.log('=== DIAGNÓSTICO RESPUESTA OPENROUTER ===');
    console.log('Status:', openRouterResponse.status);
    console.log('Headers:', Object.fromEntries(openRouterResponse.headers.entries()));
    console.log('Raw Response:', responseText);
    console.log('==========================================');

    // Intentar parsear la respuesta
    let llmResult;
    try {
      llmResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing OpenRouter response:', parseError);
      return NextResponse.json(
        { success: false, error: `Error parsing OpenRouter response: ${responseText.substring(0, 200)}...` },
        { status: 500 }
      );
    }

    const content = llmResult.choices?.[0]?.message?.content;
    const finishReason = llmResult.choices?.[0]?.finish_reason;

    console.log('Finish reason:', finishReason);
    console.log('Usage:', llmResult.usage);

    if (!content) {
      console.error('No content in LLM response:', llmResult);
      return NextResponse.json(
        { success: false, error: 'No se recibió respuesta del LLM' },
        { status: 500 }
      );
    }

    // Verificar si la respuesta fue cortada por límite de tokens
    if (finishReason === 'length') {
      console.warn('Response truncated due to token limit. Finish reason:', finishReason, 'Content length:', content.length);
      return NextResponse.json(
        { success: false, error: 'La respuesta del modelo fue cortada por límite de tokens. Intenta con un documento más pequeño.' },
        { status: 500 }
      );
    }

    // Verificar si la respuesta es sospechosamente corta (pero no bloquear automáticamente)
    if (content.length < 50) {
      console.warn('Very short response detected. Content length:', content.length, 'Content:', content);
      // No retornamos error aquí, intentamos procesar de todas formas
    }

    // Parsear la respuesta JSON de Nvidia Llama 3.1 Nemotron Ultra
    console.log('=== DIAGNÓSTICO CONTENIDO LLM ===');
    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 500));
    console.log('================================');

    let topics: StudyTopic[];
    try {
      // Limpiar el contenido paso a paso
      let cleanContent = content.trim();
      console.log('Step 1 - Trimmed:', cleanContent.substring(0, 200));
      
      // Remover posibles marcadores de código
      cleanContent = cleanContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
      console.log('Step 2 - Removed code blocks:', cleanContent.substring(0, 200));
      
      // Remover texto antes y después del JSON
      cleanContent = cleanContent.replace(/^[^[\{]*/, '').replace(/[^\]\}]*$/, '');
      console.log('Step 3 - Cleaned text:', cleanContent.substring(0, 200));
      
      // Buscar JSON más agresivamente con patrones mejorados
      const jsonPatterns = [
        /\[[\s\S]*\]/,   // Array completo (greedy match)
        /\{[\s\S]*\}/,   // Objeto único (greedy match)
        /(\[[\s\S]*)/,   // Array que empieza pero puede no terminar
      ];
      
      let jsonString = '';
      for (const pattern of jsonPatterns) {
        const match = cleanContent.match(pattern);
        if (match) {
          jsonString = match[0];
          console.log('Found JSON with pattern:', pattern, 'Result length:', jsonString.length);
          break;
        }
      }
      
      if (!jsonString) {
        // Último intento: usar todo el contenido limpio
        jsonString = cleanContent;
        console.log('Using entire cleaned content as JSON');
      }
      
      // Intentar reparar JSON común
      jsonString = jsonString
        .replace(/,\s*}/g, '}')  // Remover comas finales en objetos
        .replace(/,\s*]/g, ']')  // Remover comas finales en arrays
        .replace(/'/g, '"');     // Cambiar comillas simples por dobles
      
      console.log('Final JSON string:', jsonString.substring(0, 300));
      
      topics = JSON.parse(jsonString);
      
      // Validar que sea un array
      if (!Array.isArray(topics)) {
        console.log('Response is not an array, wrapping in array');
        topics = [topics];
      }
      
      console.log('Parsed topics count:', topics.length);
      
      // Validar estructura de cada tema
      const validTopics = topics.filter(topic => {
        const isValid = topic.tema && 
          typeof topic.frecuencia === 'number' && 
          typeof topic.dificultad === 'number' &&
          Array.isArray(topic.tipo_preguntas) &&
          typeof topic.orden_estudio === 'number' &&
          topic.guia_resolucion &&
          Array.isArray(topic.preguntas_ejemplo) &&
          Array.isArray(topic.recursos);
        
        if (!isValid) {
          console.log('Invalid topic filtered out:', topic);
        }
        return isValid;
      });
      
      topics = validTopics;
      console.log('Valid topics after filtering:', topics.length);
      
    } catch (parseError) {
      console.error('Error parsing Nvidia Llama 3.1 Nemotron Ultra response:', parseError);
      console.error('Raw content:', content);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Error desconocido';
      return NextResponse.json(
        { success: false, error: `Error al procesar la respuesta: ${errorMessage}. Contenido: ${content.substring(0, 200)}...` },
        { status: 500 }
      );
    }

    // Validar y ordenar los temas
    const validTopics = topics
      .filter(topic => topic.tema && typeof topic.frecuencia === 'number')
      .sort((a, b) => a.orden_estudio - b.orden_estudio);

    // Guardar la guía de estudio en la base de datos
    const studyGuide = new StudyGuide({
      examId,
      subjectId: exam.subjectId,
      userId: user._id,
      topics: validTopics.map(topic => ({
        topicName: topic.tema,
        frecuencia: topic.frecuencia,
        dificultad: topic.dificultad,
        tipoPreguntas: topic.tipo_preguntas,
        ordenEstudio: topic.orden_estudio,
        guiaResolucion: {
          descripcionGeneral: topic.guia_resolucion?.descripcion_general || `Guía de estudio para ${topic.tema}`,
          metodologiaEstudio: topic.guia_resolucion?.metodologia_estudio || [],
          conceptosClave: topic.guia_resolucion?.conceptos_clave || [],
          erroresComunes: topic.guia_resolucion?.errores_comunes || []
        },
        sampleQuestions: (topic.preguntas_ejemplo || []).map(q => ({
          question: q.pregunta,
          tipo: q.tipo,
          dificultad: q.dificultad,
          stepByStepSolution: q.solucion_paso_a_paso || [],
          variations: q.variaciones || [],
          atypicalCases: q.casos_atipicos || []
        })),
        resources: (topic.recursos || []).map(resource => ({
          type: resource.tipo || 'web',
          title: resource.titulo || 'Recurso sin título',
          url: resource.url || '#',
          description: resource.descripcion || 'Descripción no disponible',
          youtubeId: resource.youtube_id || null
        }))
      })),
      overallSummary: `Análisis completo de ${validTopics.length} temas del examen "${exam.title}" de la asignatura ${exam.subjectId.name}`,
      totalTopics: validTopics.length,
      processingTime: Date.now(),
      aiModel: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free'
    });

    await studyGuide.save();

    // Marcar el examen como completado
    await Exam.findByIdAndUpdate(examId, { analysisStatus: 'completed' });

    const result = {
      topics: validTopics,
      totalTopics: validTopics.length,
      processingTime: Date.now(),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error in analyze API:', error);
    
    // Marcar el examen como error si algo falla
    if (requestBody && requestBody.examId) {
      try {
        await Exam.findByIdAndUpdate(requestBody.examId, { 
          analysisStatus: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (e) {
        console.error('Error updating exam status:', e);
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

 