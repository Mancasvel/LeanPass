const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leanpass';

// Schema del usuario (simplificado para testing)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

async function testAuth() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB exitosamente');

    // Verificar si existe el usuario de prueba
    console.log('🔍 Verificando usuario de prueba...');
    let testUser = await User.findOne({ email: 'test@test.com' });
    
    if (!testUser) {
      console.log('👤 Creando usuario de prueba...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      testUser = new User({
        email: 'test@test.com',
        passwordHash: hashedPassword,
        name: 'Usuario de Prueba'
      });
      await testUser.save();
      console.log('✅ Usuario de prueba creado exitosamente');
    } else {
      console.log('✅ Usuario de prueba ya existe');
    }

    // Probar autenticación
    console.log('🔐 Probando autenticación...');
    const isPasswordValid = await testUser.comparePassword('123456');
    console.log('✅ Autenticación:', isPasswordValid ? 'EXITOSA' : 'FALLIDA');

    // Mostrar información del usuario
    console.log('📋 Información del usuario:');
    console.log({
      id: testUser._id,
      email: testUser.email,
      name: testUser.name,
      createdAt: testUser.createdAt
    });

    // Probar generación de token JWT
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: testUser._id }, JWT_SECRET, { expiresIn: '7d' });
    console.log('🎫 Token JWT generado:', token.substring(0, 50) + '...');

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verificado:', decoded);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar test
testAuth(); 