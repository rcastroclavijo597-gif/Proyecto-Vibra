/* =========================================================
   VISTA · Fotos del lugar
   - Campo para subir fotos (clic o arrastrar) con miniaturas.
   - Galería de solo lectura (detalle, revisión, panel).
   - Visor para ver una foto en grande.
   ========================================================= */

const FotosView = {
  /**
   * Campo editable. Se dibuja dentro de un contenedor vacío.
   * @param {HTMLElement} contenedor
   * @param {object[]} fotos
   */
  renderCampo(contenedor, fotos = []) {
    const lleno = fotos.length >= FotoModel.MAX_FOTOS;
    contenedor.innerHTML = `
      <div class="fotos">
        <label class="fotos__drop ${lleno ? 'is-disabled' : ''}" data-drop>
          <input type="file" accept="image/*" multiple data-input ${lleno ? 'disabled' : ''} hidden>
          <span class="fotos__icon">${Icons.get('image')}</span>
          <span class="fotos__text">
            <strong>${lleno ? 'Ya subiste el máximo de fotos' : 'Sube fotos del lugar'}</strong>
            <span>${lleno ? 'Quita una para añadir otra.' : `Haz clic o arrástralas aquí · JPG, PNG o WEBP · máximo ${FotoModel.MAX_FOTOS}`}</span>
          </span>
          <span class="fotos__count">${fotos.length}/${FotoModel.MAX_FOTOS}</span>
        </label>
        ${fotos.length ? `<div class="fotos__grid">${fotos.map((f) => `
          <figure class="foto" data-foto-id="${f.id}">
            <img src="${f.data}" alt="${Utils.esc(f.nombre)}" data-ver>
            <button type="button" class="foto__quitar" data-quitar aria-label="Quitar ${Utils.esc(f.nombre)}">${Icons.get('x')}</button>
            <figcaption class="truncate">${Utils.esc(f.nombre)}</figcaption>
          </figure>`).join('')}</div>` : ''}
        <p class="fotos__estado" data-estado hidden></p>
      </div>`;
  },

  /** Muestra "Procesando…" mientras se comprimen las fotos. */
  ocupado(contenedor, estado) {
    const p = contenedor.querySelector('[data-estado]');
    if (!p) return;
    p.hidden = !estado;
    p.textContent = estado ? 'Procesando fotos…' : '';
    contenedor.querySelector('[data-drop]')?.classList.toggle('is-busy', estado);
  },

  /**
   * Conecta el campo una sola vez (usa delegación, así sirve aunque se redibuje).
   * @param {HTMLElement} contenedor
   * @param {{agregar: (files: File[]) => void, quitar: (id: string) => void, ver: (id: string) => void}} h
   */
  bindCampo(contenedor, h) {
    contenedor.addEventListener('change', (e) => {
      if (!e.target.matches('[data-input]')) return;
      const archivos = Array.from(e.target.files || []);
      e.target.value = ''; // permite volver a elegir el mismo archivo
      if (archivos.length) h.agregar(archivos);
    });
    contenedor.addEventListener('click', (e) => {
      const quitar = e.target.closest('[data-quitar]');
      if (quitar) { e.preventDefault(); h.quitar(quitar.closest('[data-foto-id]').dataset.fotoId); return; }
      const ver = e.target.closest('[data-ver]');
      if (ver) h.ver(ver.closest('[data-foto-id]').dataset.fotoId);
    });
    // Arrastrar y soltar
    ['dragenter', 'dragover'].forEach((tipo) => contenedor.addEventListener(tipo, (e) => {
      const drop = e.target.closest('[data-drop]');
      if (!drop || drop.classList.contains('is-disabled')) return;
      e.preventDefault();
      drop.classList.add('is-over');
    }));
    ['dragleave', 'drop'].forEach((tipo) => contenedor.addEventListener(tipo, (e) => {
      const drop = e.target.closest('[data-drop]');
      if (!drop) return;
      e.preventDefault();
      drop.classList.remove('is-over');
      if (tipo === 'drop' && !drop.classList.contains('is-disabled')) {
        const archivos = Array.from(e.dataTransfer?.files || []);
        if (archivos.length) h.agregar(archivos);
      }
    }));
  },

  /** Galería de solo lectura. Devuelve el HTML. */
  galeria(fotos = [], vacio = 'No se adjuntaron fotos.') {
    if (!fotos.length) return `<p class="muted small">${vacio}</p>`;
    return `<div class="galeria">${fotos.map((f) => `
      <button type="button" class="galeria__item" data-foto-id="${f.id}" title="Ver ${Utils.esc(f.nombre)}">
        <img src="${f.data}" alt="${Utils.esc(f.nombre)}">
      </button>`).join('')}</div>`;
  },

  /** Clic en una miniatura de una galería → handler(id). */
  bindGaleria(contenedor, handler) {
    contenedor.addEventListener('click', (e) => {
      const item = e.target.closest('.galeria__item[data-foto-id]');
      if (item) handler(item.dataset.fotoId);
    });
  },

  /** Visor: muestra la foto en grande dentro de un modal. */
  abrirVisor(foto) {
    if (!foto) return;
    ModalView.abrir({
      eyebrow: 'Foto del lugar',
      titulo: foto.nombre,
      subtitulo: `${foto.ancho} × ${foto.alto} px · ${Imagenes.pesoKB(foto.data)} KB`,
      autofoco: false,
      cuerpo: `<img class="visor__img" src="${foto.data}" alt="${Utils.esc(foto.nombre)}">`,
    });
  },
};
