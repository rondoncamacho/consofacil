// ... (imports y configuraciones iniciales)

// Antes: res.json(data);
router.get('/:edificio_id', async (req, res) => {
  const { edificio_id } = req.params;
  if (req.user.edificio_id !== edificio_id && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const { data, error } = await supabase
    .from('notificaciones')
    .select('id, mensaje, fecha')
    .eq('edificio_id', edificio_id)
    .order('fecha', { ascending: false })
    .limit(10);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Ahora la respuesta es consistente con las otras rutas
  res.json({ data });
});

module.exports = router;