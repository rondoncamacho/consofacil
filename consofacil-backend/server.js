// ... (imports y configuraciones iniciales)

const isProduction = process.env.NODE_ENV === 'production';

// ... (configuración de logger, limiter, y app.use)

app.use(cors({
  origin: isProduction
    ? process.env.CORS_ORIGIN
    : 'http://localhost:5173',
  credentials: true
}));

// ... (otros app.use)

const supabaseServiceRole = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);
const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE || !process.env.SUPABASE_ANON_KEY) {
  logger.error('Error: Variables de entorno de Supabase no están definidas');
  process.exit(1);
}

const authenticateAndAuthorize = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    logger.warn('Acceso no autorizado: token no proporcionado');
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Usa la instancia con la clave anónima para verificar el token
  const { data: { user }, error } = await supabaseAnon.auth.getUser(token);
  if (error || !user) {
    logger.error(`Error de autenticación: ${error?.message || 'Token inválido'}`);
    return res.status(403).json({ error: 'Token inválido o usuario no autorizado' });
  }

  // Ahora, usa el cliente con rol de servicio para obtener datos privados
  const { data: userData, error: userError } = await supabaseServiceRole
    .from('usuarios')
    .select('rol, edificio_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    logger.error(`Error al obtener datos de usuario: ${userError?.message || 'Datos no encontrados'}`);
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  req.user = { ...user, rol: userData.rol, edificio_id: userData.edificio_id };
  next();
};

// ... (configuración de rutas y app.listen)