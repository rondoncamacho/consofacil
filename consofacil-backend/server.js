// consofacil-backend/server.js
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const authRoutes = require('./routes/auth');
const consorcioRoutes = require('./routes/consorcios');
const expensasRoutes = require('./routes/expensas');
const ticketsRoutes = require('./routes/tickets');
const notificacionesRoutes = require('./routes/notificaciones');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

const transports = [
  new winston.transports.File({ filename: 'logs/app.log' }),
];
if (!isProduction) { // Corregido: winston en consola solo en desarrollo
  transports.push(new winston.transports.Console());
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: transports,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(cors({
  origin: isProduction
    ? process.env.CORS_ORIGIN
    : 'http://localhost:5173',
  credentials: true
}));

app.use(limiter);
app.use(helmet());
app.use(express.json());

// Se crea una sola instancia de Supabase con la clave de servicio
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  logger.error('Error: Variables de entorno de Supabase no están definidas');
  process.exit(1);
}

const authenticateAndAuthorize = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    logger.warn('Acceso no autorizado: token no proporcionado');
    return res.status(401).json({ error: 'Token requerido' });
  }

  // **CORRECCIÓN CLAVE:** Se usa la instancia con clave de servicio
  // para verificar el token del usuario y obtener sus datos.
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    logger.error(`Error de autenticación: ${error?.message || 'Token inválido'}`);
    return res.status(403).json({ error: 'Token inválido o usuario no autorizado' });
  }

  // Se obtiene el rol y edificio_id del usuario
  const { data: userData, error: userError } = await supabase.from('usuarios').select('rol, edificio_id').eq('id', user.id).single();
  if (userError || !userData) {
    logger.error(`Error al obtener datos de usuario: ${userError?.message || 'Datos no encontrados'}`);
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  req.user = { ...user, rol: userData.rol, edificio_id: userData.edificio_id };
  next();
};

app.use('/api/auth', authRoutes);
app.use('/api/consorcios', authenticateAndAuthorize, consorcioRoutes);
app.use('/api/expensas', authenticateAndAuthorize, expensasRoutes);
app.use('/api/tickets', authenticateAndAuthorize, ticketsRoutes);
app.use('/api/notificaciones', authenticateAndAuthorize, notificacionesRoutes);

app.get('/', (req, res) => res.send('ConsoFacil Backend'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Servidor en puerto ${PORT}`));

module.exports = app; // <-- Agregado para los tests