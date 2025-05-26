require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado exitosamente');

    // Verificar usuarios existentes
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      name: String,
      createdAt: Date
    }));

    const users = await User.find({}).select('email name createdAt');
    console.log(`\n👥 Usuarios encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Lista de usuarios:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.name} (${new Date(user.createdAt).toLocaleDateString()})`);
      });
      console.log('\n✅ Puedes hacer login con cualquiera de estos usuarios');
    } else {
      console.log('\n❌ No hay usuarios registrados');
      console.log('📝 Necesitas registrarte primero:');
      console.log('1. Ve a http://localhost:3000');
      console.log('2. Haz clic en "Iniciar Sesión"');
      console.log('3. Haz clic en "Regístrate aquí"');
      console.log('4. Crea una cuenta nueva');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

checkUsers(); 