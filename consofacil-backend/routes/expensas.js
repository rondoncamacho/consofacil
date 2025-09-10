// consofacil-backend/routes/expensas.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/', async (req, res) => {
  const { edificio_id, archivo, vencimiento } = req.body;
  const { data: edificio, error: edificioError } = await supabase
    .from('edificios')
    .select('unidades')
    .eq('id', edificio_id)
    .single();
  if (edificioError) return res.status(400).json({ error: 'Edificio no encontrado' });
  if (edificio.unidades > 20) return res.status(403).json({ error: 'Plan freemium: máximo 20 unidades. Contacta a soporte.' });
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });

  const { data, error } = await supabase.storage
    .from('expensas')
    .upload(`expensas/${edificio_id}/${Date.now()}.pdf`, archivo, { contentType: 'application/pdf' });
  if (error) return res.status(400).json({ error: error.message });
  const { signedURL, error: signError } = await supabase.storage
    .from('expensas')
    .createSignedUrl(data.path, 3600);
  if (signError) return res.status(400).json({ error: signError.message });
  const { data: expensa, error: insertError } = await supabase
    .from('expensas')
    .insert({ edificio_id, archivo_url: signedURL, vencimiento })
    .select();
  if (insertError) return res.status(400).json({ error: insertError.message });
  res.json(expensa);
});

router.get('/:edificio_id', async (req, res) => {
  const { edificio_id } = req.params;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { data, error } = await supabase
    .from('expensas')
    .select('id, archivo_url, vencimiento')
    .eq('edificio_id', edificio_id);
  if (error) return res.status(400).json({ error: error.message });

  // **CORRECCIÓN CLAVE:** Manejo correcto de la promesa asíncrona de createSignedUrl
  const signedData = await Promise.all(
    data.map(async (e) => {
      const { data: signed, error: signError } = await supabase.storage
        .from('expensas')
        .createSignedUrl(e.archivo_url, 3600);
      if (signError) return { ...e, archivo_url: null };
      return { ...e, archivo_url: signed.signedUrl };
    })
  );
  res.json(signedData);
});

module.exports = router;