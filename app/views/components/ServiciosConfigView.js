/* =========================================================
   VISTA · Configuración técnica de servicios
   Para sonido, iluminación y efectos el usuario elige el tipo
   de equipo y la cantidad con un contador (− 0 +).
   Se usa en el paso 2 del cliente y en el modal del admin.
   ========================================================= */

const ServiciosConfigView = {
  /**
   * @param {HTMLElement} contenedor
   * @param {{id:string, config:any}[]} seleccion servicios elegidos
   */
  render(contenedor, seleccion) {
    contenedor.innerHTML = seleccion.length
      ? `<div class="svc-config-list">${seleccion.map((item) => ServiciosConfigView.bloque(item)).join('')}</div>`
      : '';
    ServiciosConfigView.bindContadores(contenedor);
  },

  bloque(item) {
    const def = Catalogo.servicio(item.id);
    const c = def.config;
    const head = `<div class="svc-config__head"><span class="tone tone--${def.tono}">${Icons.get(def.icono)}</span>${Utils.esc(def.nombre)}</div>`;

    if (!c) {
      return `<div class="svc-config" data-svc="${def.id}">${head}<p class="svc-config__none">No necesita configuración adicional.</p></div>`;
    }

    if (c.tipo === 'texto') {
      return `<div class="svc-config" data-svc="${def.id}">${head}
        <div class="field"><label>${c.label}</label>
        <textarea class="textarea" data-cfg-texto rows="2" placeholder="Una experiencia temática, un artista concreto…">${Utils.esc(typeof item.config === 'string' ? item.config : '')}</textarea></div></div>`;
    }

    // tipo 'cantidades': una tarjeta por equipo con su contador
    const elegidos = Array.isArray(item.config) ? item.config.filter((x) => typeof x === 'object') : [];
    const cantidadDe = (id) => elegidos.find((x) => x.id === id)?.cantidad || 0;
    return `
      <div class="svc-config" data-svc="${def.id}" data-campo="cfg-${def.id}">
        ${head}
        <p class="svc-config__label">${c.label}</p>
        <div class="qty-grid">
          ${c.items.map((eq) => {
            const n = cantidadDe(eq.id);
            return `
              <div class="qty-item ${n > 0 ? 'is-active' : ''}" data-equipo="${eq.id}">
                <div class="qty-item__text">
                  <strong>${Utils.esc(eq.nombre)}</strong>
                  <span>${Utils.esc(eq.detalle)}</span>
                </div>
                <div class="stepper">
                  <button type="button" data-paso="-1" aria-label="Quitar ${Utils.esc(eq.nombre)}">−</button>
                  <input type="number" min="0" max="${eq.max}" value="${n}" data-cantidad aria-label="Cantidad de ${Utils.esc(eq.nombre)}">
                  <button type="button" data-paso="1" aria-label="Añadir ${Utils.esc(eq.nombre)}">+</button>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  /** Botones − / + y escritura directa. Se conecta una sola vez por contenedor. */
  bindContadores(contenedor) {
    if (contenedor.dataset.contadores) return;
    contenedor.dataset.contadores = '1';

    const ajustar = (input, valor) => {
      const max = Number(input.max) || 99;
      const n = Math.max(0, Math.min(max, Math.round(Number(valor) || 0)));
      input.value = n;
      input.closest('.qty-item').classList.toggle('is-active', n > 0);
    };

    contenedor.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-paso]');
      if (!btn) return;
      const input = btn.parentElement.querySelector('[data-cantidad]');
      ajustar(input, Number(input.value) + Number(btn.dataset.paso));
      // Avisa al formulario para que se autoguarde y se limpien los errores
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    contenedor.addEventListener('change', (e) => {
      if (e.target.matches('[data-cantidad]')) ajustar(e.target, e.target.value);
    });
  },

  /** Devuelve [{id, config}] con lo que hay en pantalla. */
  leer(contenedor) {
    return Utils.$$('.svc-config', contenedor).map((bloque) => {
      const id = bloque.dataset.svc;
      const def = Catalogo.servicio(id);
      let config = null;
      if (def.config?.tipo === 'texto') {
        config = bloque.querySelector('[data-cfg-texto]').value.trim() || null;
      }
      if (def.config?.tipo === 'cantidades') {
        const lista = Utils.$$('[data-equipo]', bloque)
          .map((fila) => ({ id: fila.dataset.equipo, cantidad: Number(fila.querySelector('[data-cantidad]').value) || 0 }))
          .filter((x) => x.cantidad > 0);
        config = lista.length ? lista : null;
      }
      return { id, config };
    });
  },

  /** Combina la selección nueva con lo ya configurado (para no perder datos). */
  combinar(ids, anteriores) {
    return ids.map((id) => anteriores.find((s) => s.id === id) || { id, config: null });
  },
};
