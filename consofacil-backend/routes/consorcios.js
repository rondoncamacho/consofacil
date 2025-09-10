// consofacil-backend/routes/consorcios.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/', async (req, res) => {
  const { nombre } = req.body;
  const { data, error } = await supabase.from('consorcios').insert({ nombre }).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/edificios', async (req, res) => {
  const { consorcio_id, direccion, unidades } = req.body;
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { data, error } = await supabase.from('edificios').insert({
    consorcio_id,
    direccion,
    unidades
  }).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { data, error, count } = await supabase
    .from('consorcios')
    .select('*, edificios(*)', { count: 'exact' })
    .range((page - 1) * limit, page * limit - 1);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data, total: count });
});

module.exports = router;