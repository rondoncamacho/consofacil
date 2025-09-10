// consofacil-backend/routes/notificaciones.js

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/', async (req, res) => {
  const { edificio_id, mensaje } = req.body;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { data: usuarios, error } = await supabase.from('usuarios').select('email').eq('edificio_id', edificio_id);
  if (error) return res.status(400).json({ error: 'Error al obtener usuarios' });

  const emails = usuarios.map(u => u.email);
  const msg = {
    to: emails,
    from: process.env.EMAIL_USER,
    subject: 'Notificación ConsoFacil',
    text: mensaje,
  };
  try {
    await sgMail.send(msg);
  } catch (sgError) {
    console.error('Error al enviar correo con SendGrid:', sgError);
  }

  const { data, error: insertError } = await supabase.from('notificaciones').insert({
    edificio_id,
    mensaje,
    fecha: new Date()
  }).select();
  if (insertError) return res.status(400).json({ error: insertError.message });
  res.json(data);
});

router.get('/:edificio_id', async (req, res) => {
  const { edificio_id } = req.params;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { data, error } = await supabase
    .from('notificaciones')
    .select('id, mensaje, fecha')
    .eq('edificio_id', edificio_id)
    .order('fecha', { ascending: false })
    .limit(10);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

module.exports = router;