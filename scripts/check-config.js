const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de LeanPass...\n');

// Verificar archivo .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log('📁 Archivo .env.local:', envExists ? '✅ Existe' : '❌ No encontrado');

if (envExists) {
  // Cargar variables de entorno
  require('dotenv').config({ path: envPath });
  
  console.log('\n🔧 Variables de entorno:');
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurado' : '❌ No configurado');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado');
  console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ No configurado');
  
  // Verificar formato de MongoDB URI
  if (process.env.MONGODB_URI) {
    const uri = process.env.MONGODB_URI;
    if (uri.includes('<username>') || uri.includes('<password>') || uri.includes('<cluster>')) {
      console.log('⚠️  MONGODB_URI contiene placeholders. Reemplaza <username>, <password> y <cluster> con valores reales.');
    } else if (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://')) {
      console.log('✅ Formato de MONGODB_URI válido');
    } else {
      console.log('❌ Formato de MONGODB_URI inválido');
    }
  }
} else {
  console.log('\n📝 Para crear el archivo .env.local, copia este contenido:');
  console.log('---');
  console.log('# MongoDB Configuration');
  console.log('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/leanpass?retryWrites=true&w=majority');
  console.log('JWT_SECRET=tu-clave-secreta-super-segura-aqui');
  console.log('OPENROUTER_API_KEY=tu-openrouter-api-key-aqui');
  console.log('---');
}

// Verificar dependencias
console.log('\n📦 Verificando dependencias...');
try {
  require('mongoose');
  console.log('- mongoose: ✅ Instalado');
} catch {
  console.log('- mongoose: ❌ No instalado');
}

try {
  require('bcryptjs');
  console.log('- bcryptjs: ✅ Instalado');
} catch {
  console.log('- bcryptjs: ❌ No instalado');
}

try {
  require('jsonwebtoken');
  console.log('- jsonwebtoken: ✅ Instalado');
} catch {
  console.log('- jsonwebtoken: ❌ No instalado');
}

console.log('\n🚀 Próximos pasos:');
if (!envExists) {
  console.log('1. Crear archivo .env.local con la configuración de MongoDB');
  console.log('2. Configurar MongoDB Atlas o MongoDB local');
  console.log('3. Reiniciar la aplicación con: npm run dev');
} else {
  console.log('1. Verificar que MongoDB esté accesible');
  console.log('2. Reiniciar la aplicación si es necesario');
  console.log('3. Registrar un usuario desde la interfaz web');
}

console.log('\n📖 Para más información, consulta: CONFIGURACION_MONGODB.md'); 