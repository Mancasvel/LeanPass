require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function testFileAnalysis() {
  console.log('🔬 Probando análisis completo de archivos...\\n');

  try {
    // 1. Hacer login
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Error en login:', loginData.error);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login exitoso');

    // 2. Crear asignatura
    console.log('\\n2️⃣ Creando asignatura...');
    const subjectResponse = await fetch('http://localhost:3000/api/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        name: `Matemáticas Test ${Date.now()}`,
        description: 'Asignatura de prueba para análisis'
      })
    });

    const subjectData = await subjectResponse.json();
    if (!subjectData.success) {
      console.log('❌ Error creando asignatura:', subjectData.error);
      return;
    }

    const subjectId = subjectData.data._id;
    console.log('✅ Asignatura creada:', subjectData.data.name);

    // 3. Crear archivo de prueba
    console.log('\\n3️⃣ Creando archivo de prueba...');
    const testContent = `
EXAMEN DE MATEMÁTICAS - ÁLGEBRA LINEAL

1. Sistemas de ecuaciones lineales
   - Método de Gauss
   - Método de Gauss-Jordan
   - Regla de Cramer

2. Matrices
   - Operaciones básicas
   - Determinantes
   - Matriz inversa

3. Espacios vectoriales
   - Vectores en R^n
   - Dependencia e independencia lineal
   - Base y dimensión

PROBLEMAS:

1. Resolver el sistema:
   2x + 3y = 7
   x - y = 1

2. Calcular el determinante de la matriz:
   |2  1|
   |3  4|

3. Encontrar la base del espacio vectorial generado por los vectores:
   v1 = (1, 2, 0)
   v2 = (0, 1, 1)
   v3 = (1, 3, 1)
`;

    const testFile = new File([testContent], 'test-exam.txt', { type: 'text/plain' });
    
    // 4. Subir archivo como examen
    console.log('\\n4️⃣ Subiendo archivo...');
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('subjectId', subjectId);
    formData.append('title', 'Examen de Álgebra Lineal');

    const uploadResponse = await fetch('http://localhost:3000/api/exams', {
      method: 'POST',
      headers: {
        'Cookie': cookies
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();
    if (!uploadData.success) {
      console.log('❌ Error subiendo archivo:', uploadData.error);
      return;
    }

    const examId = uploadData.data._id;
    console.log('✅ Archivo subido como examen:', uploadData.data.title);

    // 5. Analizar examen
    console.log('\\n5️⃣ Analizando examen...');
    const analyzeResponse = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({ examId })
    });

    const analyzeData = await analyzeResponse.json();
    if (!analyzeData.success) {
      console.log('❌ Error analizando:', analyzeData.error);
      return;
    }

    console.log('✅ Análisis completado!');
    console.log('📊 Temas encontrados:', analyzeData.data.totalTopics);
    console.log('\\n📋 Resumen de temas:');
    
    analyzeData.data.topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.tema} (Dificultad: ${topic.dificultad}/5)`);
    });

    console.log('\\n🎉 ¡Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testFileAnalysis().catch(console.error); 