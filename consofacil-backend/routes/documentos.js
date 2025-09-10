// consofacil-backend/routes/documentos.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

router.post('/upload', async (req, res) => {
  const { edificio_id, nombre, archivo } = req.body;
  if (req.user.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  
  const filePath = `documentos/${edificio_id}/${Date.now()}_${nombre}`;
  const { data: fileData, error: uploadError } = await supabase.storage
    .from('documentos')
    .upload(filePath, archivo, { contentType: 'application/pdf' });

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  const { error: insertError } = await supabase.from('documentos').insert({
    edificio_id,
    nombre,
    archivo_url: filePath
  });

  if (insertError) return res.status(400).json({ error: insertError.message });
  res.status(200).json({ message: 'Documento subido exitosamente' });
});

router.get('/:edificio_id', async (req, res) => {
  const { edificio_id } = req.params;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const { data, error } = await supabase.from('documentos').select('id, nombre, archivo_url, fecha_subida').eq('edificio_id', edificio_id);
  if (error) return res.status(400).json({ error: error.message });
  
  res.json(data);
});

module.exports = router;