/* =========================================================
   VIBRA · core/imagenes.js
   Herramienta para preparar imágenes antes de guardarlas.

   localStorage solo admite unos 5 MB en total. Una foto de
   celular puede pesar 3–4 MB, así que antes de guardarla se
   achica (máximo 1200 px de lado) y se convierte a JPEG.
   El resultado es un texto "data:image/jpeg;base64,..." que
   se puede guardar dentro del JSON como cualquier otro texto.
   ========================================================= */

const Imagenes = {
  /** Lee un archivo y devuelve su contenido como texto Base64 (data URL). */
  leerComoDataURL(archivo) {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(new Error(`No se pudo leer “${archivo.name}”.`));
      lector.readAsDataURL(archivo);
    });
  },

  /** Carga un data URL en un objeto Image para conocer su tamaño. */
  cargar(dataURL) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
      img.src = dataURL;
    });
  },

  /**
   * Achica y comprime una imagen.
   * @param {File} archivo
   * @param {{max?: number, calidad?: number}} op
   * @returns {Promise<{data: string, ancho: number, alto: number}>}
   */
  async comprimir(archivo, { max = 1200, calidad = 0.72 } = {}) {
    const original = await Imagenes.leerComoDataURL(archivo);
    const img = await Imagenes.cargar(original);

    // Escala proporcional: el lado más largo queda en "max" píxeles como mucho
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const ancho = Math.round(img.width * escala);
    const alto = Math.round(img.height * escala);

    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#FFFFFF'; // fondo blanco para PNG con transparencia
    ctx.fillRect(0, 0, ancho, alto);
    ctx.drawImage(img, 0, 0, ancho, alto);

    return { data: lienzo.toDataURL('image/jpeg', calidad), ancho, alto };
  },

  /** Peso aproximado en KB de un texto Base64. */
  pesoKB(dataURL) {
    const base64 = dataURL.split(',')[1] || '';
    return Math.round((base64.length * 3) / 4 / 1024);
  },
};
