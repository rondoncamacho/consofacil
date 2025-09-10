// Archivo: consofacil-backend/server.js

// ... (imports y configuraciones)
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
// ... (resto de imports)

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
// ... (otras configuraciones)

// Crea una sola instancia de Supabase con la clave de servicio
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

// ... (verificación de variables de entorno)

const authenticateAndAuthorize = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // **Paso 1: Valida el token del usuario con la instancia de Supabase**
  // Esta función no requiere la clave anónima en el backend; la clave de servicio es suficiente
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    // Si el token no es válido o está expirado, devuelve 403 Forbidden
    return res.status(403).json({ error: 'Token inválido o usuario no autorizado' });
  }

  // **Paso 2: Usa el ID del usuario validado para obtener sus datos de la base de datos**
  // La clave de servicio permite esta consulta sin problemas
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('rol, edificio_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  req.user = { ...user, rol: userData.rol, edificio_id: userData.edificio_id };
  next();
};

// ... (configuración de rutas y app.listen)