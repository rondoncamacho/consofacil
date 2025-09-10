const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/registro', async (req, res) => {
  const { email, password, rol, consorcio_id, edificio_id } = req.body;
  if (!['admin', 'usuario'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message === 'Email already registered' ? 'Email ya registrado' : error.message });
  const { error: userError } = await supabase.from('usuarios').insert({
    id: data.user.id,
    email,
    rol,
    consorcio_id,
    edificio_id
  });
  if (userError) return res.status(400).json({ error: userError.message === 'duplicate key value violates unique constraint' ? 'Email ya registrado' : userError.message });
  res.json({ message: 'Usuario registrado' });
});

router.post('/login', async (req, res) => {
  const { data, error } = await supabase.auth.signInWithPassword(req.body);
  if (error) return res.status(400).json({ error: error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message });
  if (!data.session) return res.status(400).json({ error: 'Sesión inválida, por favor intente de nuevo.' });
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('edificio_id, rol')
    .eq('id', data.user.id)
    .single();
  if (userError) return res.status(400).json({ error: 'Usuario no encontrado' });
  const { data: { session } } = await supabase.auth.refreshSession({ refresh_token: data.session.refresh_token });
  res.json({ token: session.access_token, refresh_token: session.refresh_token, edificio_id: userData.edificio_id, rol: userData.rol });
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.headers['authorization']?.split(' ')[1];
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token requerido' });
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error) return res.status(403).json({ error: 'Refresh token inválido' });
  res.json({ token: data.session.access_token, refresh_token: data.session.refresh_token });
});

router.get('/user-role', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(403).json({ error: 'Token inválido o usuario no autorizado' });
  const { data: userData, error: userError } = await supabase.from('usuarios').select('rol').eq('id', user.id).single();
  if (userError) return res.status(400).json({ error: 'Usuario no encontrado' });
  res.json({ rol: userData.rol });
});

module.exports = router;