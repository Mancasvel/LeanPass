require('dotenv').config({ path: '.env.local' });

async function testLogin() {
  console.log('🔐 Probando login con diferentes contraseñas...\n');

  const email = 'mancasvel1@alum.us.es';
  const passwords = ['123456', 'password', 'test123', '123', 'admin', 'user123', 'ksty123', 'ksty'];

  for (const password of passwords) {
    try {
      console.log(`🔑 Probando contraseña: "${password}"`);
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ¡Login exitoso con contraseña: "${password}"!`);
        console.log(`👤 Usuario: ${data.data.user.name}`);
        
        // Probar petición autenticada
        const cookies = response.headers.get('set-cookie');
        if (cookies) {
          console.log('\n🍪 Probando petición con cookies...');
          const subjectsResponse = await fetch('http://localhost:3000/api/subjects', {
            headers: {
              'Cookie': cookies
            }
          });
          
          const subjectsData = await subjectsResponse.json();
          console.log('Petición autenticada:', subjectsData.success ? '✅ Exitosa' : '❌ Falló');
        }
        
        return;
      } else {
        console.log(`❌ Falló: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n❌ No se pudo encontrar la contraseña correcta');
  console.log('💡 Puedes registrar un nuevo usuario o resetear la contraseña');
}

testLogin(); 