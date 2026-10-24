/* =========================================================
   MODELO · Foto
   Reglas para las fotos del lugar del evento:
   qué archivos se aceptan, cuántas fotos como máximo y cómo
   se preparan para guardarse dentro de la solicitud.

   Cada foto se guarda así (dentro de "fotos" en vibra_eventos):
   { "id": "f1729...", "nombre": "salon.jpg",
     "data": "data:image/jpeg;base64,...", "ancho": 1200, "alto": 800 }
   ========================================================= */

const FotoModel = {
  MAX_FOTOS: 3,
  MAX_MB: 15, // tamaño máximo del archivo original (antes de comprimir)
  TIPOS: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  /** Revisa un archivo. Lanza un Error con el motivo si no sirve. */
  validarArchivo(archivo, cantidadActual) {
    if (cantidadActual >= FotoModel.MAX_FOTOS) {
      throw new Error(`Puedes subir como máximo ${FotoModel.MAX_FOTOS} fotos.`);
    }
    if (!FotoModel.TIPOS.includes(archivo.type)) {
      throw new Error(`“${archivo.name}” no es una imagen válida. Usa JPG, PNG, WEBP o GIF.`);
    }
    if (archivo.size > FotoModel.MAX_MB * 1024 * 1024) {
      throw new Error(`“${archivo.name}” pesa más de ${FotoModel.MAX_MB} MB.`);
    }
  },

  /**
   * Valida, achica y convierte varios archivos.
   * Devuelve las fotos listas y los errores de las que no se pudieron usar.
   * @param {FileList|File[]} archivos
   * @param {number} cantidadActual fotos que ya tiene la solicitud
   */
  async preparar(archivos, cantidadActual = 0) {
    const fotos = [];
    const errores = [];
    for (const archivo of Array.from(archivos)) {
      try {
        FotoModel.validarArchivo(archivo, cantidadActual + fotos.length);
        const { data, ancho, alto } = await Imagenes.comprimir(archivo);
        fotos.push({
          id: `f${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          nombre: archivo.name,
          data, ancho, alto,
        });
      } catch (err) {
        errores.push(err.message);
      }
    }
    return { fotos, errores };
  },

  quitar(fotos, id) { return (fotos || []).filter((f) => f.id !== id); },
};
