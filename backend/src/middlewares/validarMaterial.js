export function validarMaterial(req,res,next) {
  const data = req.body;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return res.status(400).json({ error: 'Envía un objeto JSON.' });
  const limites = { codigo:40, nombre:150, categoria:100, subcategoria:100, unidad:20 };
  const limpio = {};
  for (const [campo,max] of Object.entries(limites)) {
    if (typeof data[campo] !== 'string' || !data[campo].trim() || data[campo].trim().length > max)
      return res.status(400).json({ error: `${campo} es obligatorio y admite hasta ${max} caracteres.` });
    limpio[campo] = data[campo].trim();
  }
  const decimal = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 999999999.999 && Math.abs(value*1000-Math.round(value*1000)) < 0.0001;
  if (!decimal(data.demanda_promedio) || !decimal(data.demanda_maxima) || data.demanda_maxima < data.demanda_promedio)
    return res.status(400).json({ error: 'Las demandas deben ser números no negativos con hasta tres decimales; la máxima debe ser mayor o igual a la promedio.' });
  if (!Number.isInteger(data.tiempo_entrega) || data.tiempo_entrega < 1 || data.tiempo_entrega > 3650)
    return res.status(400).json({ error: 'tiempo_entrega debe ser un entero entre 1 y 3650 días.' });
  if (!Number.isSafeInteger(data.ubicacion_id) || data.ubicacion_id < 1 || !decimal(data.stock_minimo) || !decimal(data.stock_maximo) || data.stock_maximo < data.stock_minimo)
    return res.status(400).json({ error: 'Indica una ubicación válida y límites de stock no negativos, con máximo mayor o igual al mínimo.' });
  req.body = {...data,...limpio};
  next();
}
