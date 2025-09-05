const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    next();
  });
};

router.post('/registro', async (req, res) => {
  const { email, password, rol, consorcio_id, edificio_id } = req.body;
  if (!['admin', 'usuario'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  const { error: userError } = await supabase.from('usuarios').insert({
    id: data.user.id,
    email,
    rol,
    consorcio_id,
    edificio_id
  });
  if (userError) return res.status(400).json({ error: userError.message });
  res.json({ message: 'Usuario registrado' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('edificio_id, rol')
    .eq('id', data.user.id)
    .single();
  if (userError) return res.status(400).json({ error: userError.message });
  const refreshToken = jwt.sign({ userId: data.user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token: data.session.access_token, refresh_token: refreshToken, edificio_id: userData.edificio_id, rol: userData.rol });
});

router.post('/refresh', authenticateToken, async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  const { userId } = jwt.verify(token, process.env.JWT_SECRET || 'secret');
  const { data } = await supabase.auth.getSession(userId);
  res.json({ token: data.session.access_token });
});

module.exports = router;