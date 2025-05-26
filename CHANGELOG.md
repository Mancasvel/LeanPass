# Changelog - LeanPass

## [v3.0.0] - Migración a Gemini 2.5 Pro Experimental

### 🚀 Nuevas Características Principales

- **Modelo Gemini 2.5 Pro**: Migración a Google Gemini 2.5 Pro Experimental
- **Contexto Masivo**: 1 millón de tokens de entrada (≈750,000 palabras)
- **Salida Extensa**: Hasta 66,000 tokens de respuesta
- **Procesamiento Completo**: Análisis de documentos enteros sin fragmentación
- **Análisis Exhaustivo**: Identificación de 8-15 temas con análisis detallado

### 🔧 Mejoras Técnicas

- **Eliminación de Chunking**: Ya no es necesario dividir documentos largos
- **Parsing Simplificado**: Manejo directo de respuestas JSON sin etiquetas especiales
- **Validación Robusta**: Filtrado automático de temas con estructura válida
- **Prompts Optimizados**: Instrucciones específicas para análisis académico

### 📝 Nuevo Flujo de Procesamiento

1. **Carga del documento completo** (sin límite práctico de tamaño)
2. **Análisis integral** con Gemini 2.5 Pro
3. **Extracción y validación** de JSON estructurado
4. **Presentación de resultados** con todos los temas identificados

### 🎯 Configuración del Modelo

```javascript
{
  model: 'google/gemini-2.5-pro-exp-03-25',
  temperature: 0.2,
  max_tokens: 8000,
  messages: [
    {
      role: 'user',
      content: 'Análisis académico exhaustivo...'
    }
  ]
}
```

### 📚 Prompt Engineering Mejorado

- **Instrucciones específicas**: Análisis académico y pedagógico
- **Criterios claros**: Frecuencia, dificultad, tipos de preguntas
- **Estructura definida**: JSON con campos validados
- **Cobertura completa**: Identificación de todos los temas relevantes

### 🐛 Correcciones y Optimizaciones

- Eliminación de funciones auxiliares innecesarias
- Simplificación del código de parsing
- Mejor manejo de errores específicos de Gemini
- Validación mejorada de estructura de datos

---

## [v2.0.0] - Actualización DeepHermes 3 Preview

### 🚀 Nuevas Características

- **Modelo DeepHermes 3**: Migración de GPT-4o-mini a DeepHermes 3 Mistral 24B Preview
- **Razonamiento Profundo**: Implementación de cadenas de pensamiento con etiquetas `<think>`
- **Procesamiento de Documentos Largos**: División automática en fragmentos para documentos > 8000 caracteres
- **Consolidación Inteligente**: Deduplicación y consolidación de temas de múltiples fragmentos
- **Análisis Mejorado**: Prompts optimizados para análisis académico estructurado

### 🔧 Mejoras Técnicas

- **Importación Dinámica**: Solución al problema de pdf-parse con importación dinámica
- **Manejo de Chunks**: Procesamiento secuencial de fragmentos con pausas para evitar rate limiting
- **Parsing Robusto**: Limpieza automática de etiquetas `<think>` en respuestas del modelo
- **Validación Mejorada**: Verificación de formato JSON y estructura de arrays
- **Error Handling**: Manejo mejorado de errores con logs detallados

### 📝 Flujo de Procesamiento

#### Documentos Cortos (< 8000 caracteres)
1. Análisis directo con DeepHermes 3
2. Prompt con razonamiento profundo
3. Extracción y validación de JSON

#### Documentos Largos (> 8000 caracteres)
1. División automática en fragmentos por oraciones
2. Análisis individual de cada fragmento
3. Consolidación de temas duplicados
4. Reordenamiento por frecuencia y dificultad
5. Reasignación de orden de estudio

### 🎯 Configuración del Modelo

```javascript
{
  model: 'nousresearch/deephermes-3-mistral-24b-preview:free',
  temperature: 0.3,
  max_tokens: 3000,
  messages: [
    {
      role: 'system',
      content: 'You are a deep thinking AI...'
    }
  ]
}
```

### 📚 Prompt Engineering

- **Sistema**: Instrucciones para razonamiento profundo
- **Usuario**: Contexto académico con ejemplos de análisis
- **Estructura**: Formato JSON específico para temas de estudio
- **Validación**: Verificación de campos requeridos

### 🔄 Funciones Auxiliares

- `chunkText()`: División inteligente de texto por oraciones
- `processMultipleChunks()`: Procesamiento secuencial de fragmentos
- `consolidateTopics()`: Deduplicación y consolidación de temas
- `getPdfParse()`: Importación dinámica de pdf-parse

### 📖 Documentación

- README actualizado con información del nuevo modelo
- Instrucciones de configuración mejoradas
- Ejemplos de uso y características técnicas
- Archivo de prueba incluido (`test-exam.txt`)

### 🐛 Correcciones

- Problema de importación de pdf-parse resuelto
- Manejo de errores de parsing mejorado
- Validación de respuestas del modelo
- Rate limiting para múltiples requests

---

## [v1.0.0] - Versión Inicial

### Características Iniciales
- Subida de archivos PDF y TXT
- Análisis con GPT-4o-mini
- Interfaz con Next.js y TailwindCSS
- Estado con Zustand
- Componentes modulares 