// consofacil-backend/routes/tickets.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/', async (req, res) => {
  const { edificio_id, descripcion, categoria } = req.body;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { data, error } = await supabase.from('tickets').insert({
    edificio_id,
    descripcion,
    categoria,
    estado: 'abierto'
  }).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:edificio_id', async (req, res) => {
  const { edificio_id } = req.params;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { page = 1, limit = 10 } = req.query;
  const { data, error, count } = await supabase
    .from('tickets')
    .select('id, descripcion, categoria, estado')
    .eq('edificio_id', edificio_id)
    .range((page - 1) * limit, page * limit - 1)
    .order('id', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ data, total: count });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  if (!['abierto', 'cerrado'].includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('edificio_id')
    .eq('id', id)
    .single();
  if (ticketError) return res.status(404).json({ error: 'Ticket no encontrado' });
  if (req.user.edificio_id !== ticket.edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { data, error } = await supabase.from('tickets').update({ estado }).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;