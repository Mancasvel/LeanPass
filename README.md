# LeanPass - Generador de Guías de Estudio con IA y MongoDB

LeanPass es una aplicación web completa que utiliza inteligencia artificial para analizar exámenes antiguos y generar guías de estudio personalizadas. Con un sistema completo de usuarios, gestión de asignaturas y almacenamiento persistente en MongoDB.

## 🚀 Características Principales

### 🔐 Sistema de Usuarios
- **Autenticación completa**: Registro y login con JWT
- **Gestión de sesiones**: Tokens seguros con expiración
- **Perfiles de usuario**: Información personal y preferencias

### 📚 Gestión de Contenido
- **Asignaturas**: Organiza tus exámenes por materias
- **Subida de exámenes**: Soporte para PDF y TXT (hasta 10MB)
- **Análisis inteligente**: IA procesa y genera guías automáticamente
- **Historial completo**: Acceso a todos tus análisis anteriores

### 🤖 IA Avanzada
- **Análisis profundo**: Identifica temas, frecuencia y dificultad
- **Guías detalladas**: Metodología paso a paso para cada tema
- **Preguntas ejemplo**: Con soluciones detalladas y variaciones
- **Recursos multimedia**: Enlaces a YouTube y sitios web educativos
- **Videos embebidos**: Visualización directa de contenido de YouTube

### 💾 Base de Datos MongoDB
- **Almacenamiento persistente**: Todos tus datos seguros en la nube
- **Relaciones optimizadas**: Estructura eficiente entre usuarios, asignaturas y exámenes
- **Búsquedas rápidas**: Índices optimizados para mejor rendimiento

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15**: Framework React con App Router
- **React 19**: Última versión con mejoras de rendimiento
- **TailwindCSS 4**: Diseño moderno y responsivo
- **TypeScript**: Type safety completo
- **Zustand**: Gestión de estado global

### Backend
- **MongoDB**: Base de datos NoSQL con Mongoose ODM
- **JWT**: Autenticación segura con tokens
- **bcryptjs**: Hashing seguro de contraseñas
- **Multer**: Manejo de archivos multipart

### IA y Procesamiento
- **OpenRouter API**: Acceso a modelos de IA avanzados
- **Nvidia Llama 3.1 Nemotron Ultra**: Modelo principal para análisis
- **pdf-parse**: Extracción de texto de PDFs

## 📦 Instalación Rápida

1. **Clona el repositorio**:
```bash
git clone <repository-url>
cd leanpass-app
```

2. **Instala dependencias**:
```bash
npm install
```

3. **Configuración automática**:
```bash
npm run setup
```

4. **Configura variables de entorno**:
Edita `.env.local` con tus credenciales:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/leanpass
OPENROUTER_API_KEY=tu_api_key_de_openrouter
JWT_SECRET=tu_clave_secreta_jwt
```

5. **Ejecuta la aplicación**:
```bash
npm run dev
```

## 🗄️ Configuración de MongoDB

### MongoDB Atlas (Recomendado)
1. Crea una cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un cluster gratuito (M0)
3. Configura un usuario de base de datos
4. Obtén tu connection string
5. Actualiza `MONGODB_URI` en `.env.local`

### Esquema de Base de Datos
```javascript
// Usuarios
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  createdAt: Date,
  updatedAt: Date
}

// Asignaturas
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}

// Exámenes
{
  _id: ObjectId,
  userId: ObjectId,
  subjectId: ObjectId,
  title: String,
  originalFileName: String,
  fileContent: String, // Base64
  fileType: String,
  analysisStatus: String, // pending, processing, completed, error
  createdAt: Date,
  updatedAt: Date
}

// Guías de Estudio
{
  _id: ObjectId,
  userId: ObjectId,
  examId: ObjectId,
  subjectId: ObjectId,
  topics: [TopicSchema], // Estructura compleja con preguntas y recursos
  totalTopics: Number,
  processingTime: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔑 Configuración de APIs

### OpenRouter API
1. Regístrate en [OpenRouter](https://openrouter.ai)
2. Obtén tu API key
3. Agrega créditos a tu cuenta
4. Actualiza `OPENROUTER_API_KEY` en `.env.local`

### Modelos Disponibles
- **Nvidia Llama 3.1 Nemotron Ultra**: Modelo principal (recomendado)
- **Google Gemini 2.5 Pro**: Alternativa de alta calidad
- **Anthropic Claude**: Para análisis complejos

## 📱 Funcionalidades del Dashboard

### 📊 Panel Principal
- **Resumen de actividad**: Estadísticas de uso
- **Acceso rápido**: A asignaturas y exámenes recientes
- **Estado de análisis**: Progreso de procesamiento en tiempo real

### 📚 Gestión de Asignaturas
- **Crear asignaturas**: Organiza por materias
- **Editar información**: Nombres y descripciones
- **Eliminar con cascada**: Borra exámenes y guías asociadas

### 📄 Gestión de Exámenes
- **Subida por drag & drop**: Interfaz intuitiva
- **Validación automática**: Tipos y tamaños de archivo
- **Estados de procesamiento**: Seguimiento visual del progreso
- **Análisis bajo demanda**: Procesa cuando necesites

### 📖 Guías de Estudio
- **Visualización completa**: Todos los temas y detalles
- **Navegación por pestañas**: Resumen, guía, preguntas, recursos
- **Videos embebidos**: YouTube integrado
- **Exportación**: Guarda tus guías (próximamente)

## 🎯 Estructura de Guías Generadas

### Por cada tema identificado:
- **📊 Análisis cuantitativo**: Frecuencia y dificultad
- **📝 Metodología**: Pasos detallados de resolución
- **❓ Preguntas ejemplo**: Con soluciones paso a paso
- **🔄 Variaciones**: Casos atípicos y alternativas
- **🌐 Recursos externos**: Enlaces web y videos de YouTube
- **📺 Videos embebidos**: Visualización directa

### Orden de estudio optimizado:
1. **Temas fundamentales**: Base teórica
2. **Temas frecuentes**: Mayor probabilidad de aparición
3. **Temas complejos**: Requieren más tiempo
4. **Repaso final**: Consolidación

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

### Asignaturas
- `GET /api/subjects` - Listar asignaturas del usuario
- `POST /api/subjects` - Crear nueva asignatura
- `PUT /api/subjects/[id]` - Actualizar asignatura
- `DELETE /api/subjects/[id]` - Eliminar asignatura

### Exámenes
- `GET /api/exams` - Listar exámenes del usuario
- `POST /api/exams` - Subir nuevo examen
- `GET /api/exams/[id]` - Obtener examen específico
- `PUT /api/exams/[id]` - Actualizar examen
- `DELETE /api/exams/[id]` - Eliminar examen

### Análisis y Guías
- `POST /api/analyze` - Analizar examen con IA
- `GET /api/study-guides` - Listar guías del usuario
- `GET /api/study-guides/[id]` - Obtener guía específica
- `DELETE /api/study-guides/[id]` - Eliminar guía

## 🚀 Despliegue en Producción

### Vercel + MongoDB Atlas
1. **Conecta tu repositorio** a Vercel
2. **Configura variables de entorno** en Vercel Dashboard
3. **Despliega automáticamente** con cada push

### Variables de entorno para producción:
```env
MONGODB_URI=mongodb+srv://...
OPENROUTER_API_KEY=sk-or-...
JWT_SECRET=clave-super-secreta-produccion
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=otra-clave-secreta
```

### Consideraciones de producción:
- **Almacenamiento de archivos**: Migrar a S3/Supabase Storage
- **CDN**: Para archivos estáticos
- **Monitoring**: Logs y métricas de rendimiento
- **Backup**: Estrategia de respaldo de MongoDB

## 🔒 Seguridad

### Implementado:
- **Hashing de contraseñas**: bcryptjs con salt
- **JWT tokens**: Expiración automática (7 días)
- **Validación de entrada**: Sanitización de datos
- **Autorización**: Middleware de autenticación
- **CORS**: Configuración segura

### Recomendaciones adicionales:
- **Rate limiting**: Para prevenir ataques
- **HTTPS**: Certificados SSL en producción
- **Validación de archivos**: Escáner de malware
- **Logs de auditoría**: Seguimiento de acciones

## 📊 Rendimiento

### Optimizaciones implementadas:
- **Índices MongoDB**: Consultas rápidas
- **Lazy loading**: Componentes bajo demanda
- **Caching**: Conexiones de base de datos
- **Compresión**: Archivos estáticos

### Métricas objetivo:
- **Tiempo de carga**: < 2 segundos
- **Análisis de IA**: < 30 segundos
- **Subida de archivos**: < 10 segundos (10MB)

## 🤝 Contribución

### Proceso de desarrollo:
1. **Fork** el repositorio
2. **Crea una rama** para tu feature
3. **Implementa** con tests
4. **Documenta** los cambios
5. **Abre un Pull Request**

### Áreas de contribución:
- **Nuevos modelos de IA**: Integración con otros proveedores
- **Exportación**: PDF, Word, Markdown
- **Colaboración**: Compartir guías entre usuarios
- **Móvil**: App nativa React Native
- **Análisis avanzado**: Gráficos y estadísticas

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles completos.

## 🆘 Soporte y Comunidad

### Documentación:
- **Wiki**: Guías detalladas
- **API Docs**: Especificación completa
- **Ejemplos**: Casos de uso comunes

### Soporte:
- **Issues**: Reporta bugs y solicita features
- **Discussions**: Preguntas y ayuda comunitaria
- **Discord**: Chat en tiempo real (próximamente)

---

**LeanPass** - Transformando la manera en que los estudiantes se preparan para sus exámenes con el poder de la inteligencia artificial y la organización inteligente. 🎓✨
