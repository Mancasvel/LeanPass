require('dotenv').config({ path: '.env.local' });

async function createTestUser() {
  console.log('👤 Creando usuario de prueba...\n');

  const testUser = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Usuario de Prueba'
  };

  try {
    console.log(`📧 Registrando: ${testUser.email}`);
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ ¡Usuario creado exitosamente!');
      console.log(`👤 Nombre: ${data.data.user.name}`);
      console.log(`📧 Email: ${data.data.user.email}`);
      
      // Probar petición autenticada con las cookies recibidas
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        console.log('\n🍪 Probando petición autenticada...');
        const subjectsResponse = await fetch('http://localhost:3000/api/subjects', {
          headers: {
            'Cookie': cookies
          }
        });
        
        const subjectsData = await subjectsResponse.json();
        console.log('Petición autenticada:', subjectsData.success ? '✅ Exitosa' : '❌ Falló');
        
        if (subjectsData.success) {
          console.log(`📚 Asignaturas: ${subjectsData.data?.length || 0}`);
        }
      }
      
      console.log('\n🎉 ¡Sistema funcionando correctamente!');
      console.log(`🔑 Puedes hacer login con:`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Contraseña: ${testUser.password}`);
      
    } else {
      console.log(`❌ Error al crear usuario: ${data.error}`);
      
      if (data.error.includes('already exists')) {
        console.log('\n🔄 Probando login con usuario existente...');
        
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testUser.email,
            password: testUser.password
          })
        });

        const loginData = await loginResponse.json();
        
        if (loginData.success) {
          console.log('✅ ¡Login exitoso con usuario existente!');
          console.log(`👤 Usuario: ${loginData.data.user.name}`);
        } else {
          console.log(`❌ Login falló: ${loginData.error}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

createTestUser(); 