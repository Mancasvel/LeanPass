# 🔧 Configuración de MongoDB para LeanPass

## 🚨 Problema Actual
El error "Access token required" indica que la aplicación no puede conectarse a MongoDB o no hay usuarios registrados.

## ✅ Solución Paso a Paso

### 1. Crear archivo `.env.local`
Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# MongoDB Configuration
# Opción 1: MongoDB Atlas (Recomendado)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/leanpass?retryWrites=true&w=majority

# Opción 2: MongoDB Local (si tienes MongoDB instalado)
# MONGODB_URI=mongodb://localhost:27017/leanpass

# JWT Secret Key
JWT_SECRET=tu-clave-secreta-super-segura-aqui

# OpenRouter API Key
OPENROUTER_API_KEY=tu-openrouter-api-key-aqui
```

### 2. Configurar MongoDB Atlas (Recomendado)

#### Paso 1: Crear cuenta en MongoDB Atlas
1. Ve a [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (usa el tier gratuito M0)

#### Paso 2: Configurar acceso
1. En "Database Access", crea un usuario con permisos de lectura/escritura
2. En "Network Access", agrega tu IP (o 0.0.0.0/0 para desarrollo)

#### Paso 3: Obtener string de conexión
1. Haz clic en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Copia el string de conexión
4. Reemplaza `<username>`, `<password>` y `<cluster>` en tu `.env.local`

### 3. Configurar MongoDB Local (Alternativa)

Si prefieres usar MongoDB localmente:

1. Instala MongoDB Community Server
2. Inicia el servicio de MongoDB
3. Usa esta configuración en `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/leanpass
```

### 4. Reiniciar la aplicación

Después de configurar `.env.local`:

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar
npm run dev
```

### 5. Crear usuario de prueba

Una vez configurado MongoDB, puedes:

1. **Opción A**: Registrarte desde la interfaz web
   - Ve a http://localhost:3000
   - Haz clic en "Iniciar Sesión"
   - Selecciona "Regístrate aquí"
   - Crea una cuenta

2. **Opción B**: Usar el script de prueba
```bash
node scripts/test-auth.js
```

## 🔍 Verificar Configuración

### Comando de verificación rápida:
```bash
# Verificar que las variables de entorno se cargan
node -e "require('dotenv').config({path:'.env.local'}); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configurado' : 'No configurado')"
```

### Logs útiles:
- Abre las herramientas de desarrollador del navegador (F12)
- Ve a la pestaña "Console"
- Haz clic en el botón "🔍 Debug Auth Status" en el dashboard
- Revisa los logs de autenticación

## 🚀 Próximos Pasos

1. ✅ Configurar `.env.local` con MongoDB
2. ✅ Reiniciar la aplicación
3. ✅ Registrar un usuario
4. ✅ Probar subida de documentos

## 📞 Soporte

Si sigues teniendo problemas:
1. Verifica que MongoDB esté accesible
2. Revisa los logs de la consola del navegador
3. Verifica que el archivo `.env.local` esté en la raíz del proyecto
4. Asegúrate de que las credenciales de MongoDB sean correctas

---

**Estado**: 🔧 **CONFIGURACIÓN PENDIENTE** - Necesitas configurar MongoDB para resolver el error de autenticación. 