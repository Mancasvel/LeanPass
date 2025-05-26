# 📚 LeanPass - Generador de Guías de Estudio con IA

LeanPass es una aplicación web que utiliza inteligencia artificial para analizar exámenes antiguos y generar guías de estudio personalizadas, ayudándote a optimizar tu preparación académica.

## 🚀 Características

- **Subida de archivos**: Soporta archivos PDF y TXT (hasta 10MB)
- **Análisis con IA avanzada**: Utiliza Gemini 2.5 Pro con 1M tokens de contexto
- **Procesamiento masivo**: Maneja documentos completos sin fragmentación
- **Guías personalizadas**: Genera temas ordenados por frecuencia y dificultad
- **Análisis exhaustivo**: Identifica todos los temas y conceptos del documento
- **Interfaz moderna**: Diseño responsive con TailwindCSS
- **Drag & Drop**: Interfaz intuitiva para subir archivos

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Estado**: Zustand
- **IA**: OpenRouter API (Nvidia Llama 3.1 Nemotron Ultra - Gratuito)
- **Procesamiento**: pdf-parse para extracción de texto

## 📋 Requisitos previos

- Node.js 18+ 
- npm o yarn
- Clave API de OpenRouter

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <tu-repositorio>
cd leanpass
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:

Crea un archivo `.env.local` en la raíz del proyecto:
```bash
# .env.local
OPENROUTER_API_KEY=tu_clave_api_aqui
```

**Importante**: Reemplaza `tu_clave_api_aqui` con tu clave real de OpenRouter.

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🎯 Cómo usar

1. **Sube tu examen**: Arrastra un archivo PDF o TXT o haz clic para seleccionarlo
2. **Espera el análisis**: La IA procesará el contenido automáticamente
3. **Revisa tu guía**: Obtén temas ordenados por prioridad con información detallada

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/analyze/          # API route para procesar archivos
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página principal
├── components/
│   ├── FileUpload.tsx        # Componente de subida de archivos
│   ├── StudyGuideResults.tsx # Componente de resultados
│   └── ErrorMessage.tsx      # Componente de errores
├── store/
│   └── useAppStore.ts        # Store de Zustand
└── types/
    └── index.ts              # Tipos TypeScript
```

## 🧠 Modelo Nvidia Llama 3.1 Nemotron Ultra (Gratuito)

LeanPass utiliza el modelo **Nvidia Llama 3.1 Nemotron Ultra** de Nvidia, que ofrece:

- **Completamente gratuito**: $0 por tokens de entrada y salida
- **Contexto masivo**: 1,000,000 tokens de entrada (≈750,000 palabras)
- **Modelo gigante**: 253B parámetros para máxima precisión
- **Seguimiento de instrucciones**: Excelente capacidad para seguir formatos específicos
- **Análisis académico**: Optimizado para tareas de comprensión y análisis

### Ventajas del procesamiento:

1. **Completamente gratuito**: Sin costos por uso del modelo
2. **Documentos masivos**: Maneja archivos de hasta 1M tokens
3. **Análisis exhaustivo**: Identifica todos los temas y conceptos
4. **Respuesta estructurada**: Genera entre 8-15 temas priorizados
5. **Precisión superior**: 253B parámetros para análisis detallado

## 🔑 Configuración de OpenRouter

1. Regístrate en [OpenRouter](https://openrouter.ai/)
2. Obtén tu clave API
3. Añádela al archivo `.env.local`

## 🚀 Despliegue

Para desplegar en Vercel:

1. Conecta tu repositorio a Vercel
2. Añade la variable de entorno `OPENROUTER_API_KEY`
3. Despliega

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si tienes problemas o preguntas, por favor abre un issue en el repositorio.
