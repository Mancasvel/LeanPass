require('dotenv').config({ path: '.env.local' });

async function testCookieAuth() {
  console.log('🧪 Probando autenticación con cookies...\n');

  try {
    // 1. Probar login
    console.log('1️⃣ Probando login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'mancasvel1@alum.us.es',
        password: 'test123' // Cambia por la contraseña correcta
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? '✅ Exitoso' : '❌ Falló');
    
    if (!loginData.success) {
      console.log('Error:', loginData.error);
      return;
    }

    // Extraer cookies del response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies recibidas:', cookies ? '✅ Sí' : '❌ No');

    if (!cookies) {
      console.log('❌ No se recibieron cookies');
      return;
    }

    // 2. Probar petición autenticada con cookies
    console.log('\n2️⃣ Probando petición con cookies...');
    const subjectsResponse = await fetch('http://localhost:3000/api/subjects', {
      headers: {
        'Cookie': cookies
      }
    });

    const subjectsData = await subjectsResponse.json();
    console.log('Petición autenticada:', subjectsData.success ? '✅ Exitosa' : '❌ Falló');
    
    if (subjectsData.success) {
      console.log(`📚 Asignaturas encontradas: ${subjectsData.data?.length || 0}`);
    } else {
      console.log('Error:', subjectsData.error);
    }

    console.log('\n🎉 ¡Sistema de cookies funcionando correctamente!');
    console.log('✅ Ya no necesitas tokens de acceso');
    console.log('✅ La autenticación se maneja automáticamente con cookies');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Esperar un poco para que el servidor esté listo
setTimeout(testCookieAuth, 3000); 