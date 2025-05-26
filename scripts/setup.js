#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando LeanPass...\n');

// Crear archivo .env.local si no existe
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/leanpass?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-${Math.random().toString(36).substring(2, 15)}

# OpenRouter API Configuration
OPENROUTER_API_KEY=your-openrouter-api-key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-${Math.random().toString(36).substring(2, 15)}
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.local creado');
  console.log('⚠️  IMPORTANTE: Actualiza las variables de entorno con tus valores reales\n');
} else {
  console.log('✅ Archivo .env.local ya existe\n');
}

// Verificar dependencias
console.log('📦 Verificando dependencias...');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const requiredDeps = [
  'mongoose',
  'bcryptjs',
  'jsonwebtoken',
  'pdf-parse',
  'next',
  'react',
  'zustand'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
if (missingDeps.length === 0) {
  console.log('✅ Todas las dependencias están instaladas\n');
} else {
  console.log('❌ Dependencias faltantes:', missingDeps.join(', '));
  console.log('Ejecuta: npm install\n');
}

// Instrucciones de configuración
console.log('📋 PASOS PARA COMPLETAR LA CONFIGURACIÓN:\n');
console.log('1. 🗄️  Configura MongoDB Atlas:');
console.log('   - Crea una cuenta en https://cloud.mongodb.com');
console.log('   - Crea un cluster gratuito');
console.log('   - Obtén tu connection string');
console.log('   - Actualiza MONGODB_URI en .env.local\n');

console.log('2. 🤖 Configura OpenRouter API:');
console.log('   - Crea una cuenta en https://openrouter.ai');
console.log('   - Obtén tu API key');
console.log('   - Actualiza OPENROUTER_API_KEY en .env.local\n');

console.log('3. 🔐 Seguridad:');
console.log('   - Cambia JWT_SECRET por una clave segura');
console.log('   - Cambia NEXTAUTH_SECRET por una clave segura\n');

console.log('4. 🚀 Ejecutar la aplicación:');
console.log('   npm run dev\n');

console.log('📚 ESTRUCTURA DE LA BASE DE DATOS:');
console.log('   - users: Usuarios del sistema');
console.log('   - subjects: Asignaturas por usuario');
console.log('   - exams: Exámenes subidos por asignatura');
console.log('   - studyguides: Guías generadas por IA\n');

console.log('🎯 FUNCIONALIDADES IMPLEMENTADAS:');
console.log('   ✅ Autenticación de usuarios (registro/login)');
console.log('   ✅ Gestión de asignaturas');
console.log('   ✅ Subida de exámenes (PDF/TXT)');
console.log('   ✅ Análisis con IA (Nvidia Llama 3.1 Nemotron Ultra)');
console.log('   ✅ Generación de guías de estudio');
console.log('   ✅ Dashboard completo');
console.log('   ✅ Recursos de YouTube embebidos\n');

console.log('🔧 Para desarrollo:');
console.log('   - Los archivos se guardan en base64 (para producción usar S3/Supabase)');
console.log('   - JWT tokens válidos por 7 días');
console.log('   - Límite de archivos: 10MB\n');

console.log('✨ ¡Configuración completada! Revisa el archivo .env.local y ejecuta npm run dev'); 