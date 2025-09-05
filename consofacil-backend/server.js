require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });
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
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.File({ filename: 'logs/app.log' })],
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://consofacil.vercel.app' : 'http://localhost:5173' }));
app.use(helmet());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) {
  logger.error('Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE no están definidas');
  process.exit(1);
}

const authenticateAndAuthorize = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ error: 'Token inválido o usuario no autorizado' });
  req.user = user;
  next();
};

app.use('/api/auth', authRoutes);
app.use('/api/consorcios', authenticateAndAuthorize, consorcioRoutes);
app.use('/api/expensas', authenticateAndAuthorize, expensasRoutes);
app.use('/api/tickets', authenticateAndAuthorize, ticketsRoutes);
app.use('/api/notificaciones', authenticateAndAuthorize, notificacionesRoutes);

app.get('/', (req, res) => res.send('ConsoFacil Backend'));

// Exporta la instancia de la aplicación para los tests
module.exports = app;

// Solo inicia el servidor si el archivo se ejecuta directamente, no durante los tests
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => logger.info(`Servidor en port ${PORT}`));
}
