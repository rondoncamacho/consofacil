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

app.use('/api/auth', authRoutes);
app.use('/api/consorcios', consorcioRoutes);
app.use('/api/expensas', expensasRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.get('/', (req, res) => res.send('ConsoFacil Backend'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Servidor en port ${PORT}`));

// Prueba de cambio a las 11:00 AM