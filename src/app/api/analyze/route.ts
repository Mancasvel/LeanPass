import { NextRequest, NextResponse } from 'next/server';
import { StudyTopic } from '@/types';

// Importación dinámica de pdf-parse para evitar problemas de SSR
const getPdfParse = async () => {
  const pdfParse = await import('pdf-parse');
  return pdfParse.default;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se encontró ningún archivo' },
        { status: 400 }
      );
    }

    // Verificar tipo de archivo
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no soportado. Solo PDF y TXT.' },
        { status: 400 }
      );
    }

    let extractedText = '';

    // Extraer texto según el tipo de archivo
    if (file.type === 'application/pdf') {
      const buffer = await file.arrayBuffer();
      const pdfParse = await getPdfParse();
      const data = await pdfParse(Buffer.from(buffer));
      extractedText = data.text;
    } else if (file.type === 'text/plain') {
      extractedText = await file.text();
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
            content: `You are an academic analysis expert. Analyze the following exam content and extract the main topics for a study guide.

EXAM CONTENT:
${extractedText}

Generate a JSON array with 8-12 topics from the exam. Each topic must have exactly these fields:
- tema: topic name (string)
- frecuencia: frequency 1-5 (number)
- dificultad: difficulty 1-5 (number) 
- tipo_preguntas: question types array (strings like "test", "desarrollo", "cálculo")
- orden_estudio: study order 1-12 (number)

Return ONLY a valid JSON array with this exact structure:
[
  {"tema": "Topic Name", "frecuencia": 4, "dificultad": 3, "tipo_preguntas": ["test", "cálculo"], "orden_estudio": 1}
]

Important: Return ONLY the JSON array, no explanations, no markdown, no additional text.`
          }
        ],
        temperature: 0.3,
        max_tokens: 16000,
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
          typeof topic.orden_estudio === 'number';
        
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
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

 