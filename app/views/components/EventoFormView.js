/* =========================================================
   VISTA · Modal "Crear evento manual" / "Editar evento"
   ========================================================= */

const EventoFormView = {
  /**
   * @param {{modo:'crear'|'editar', solicitud?:object, fecha?:string}} op
   * @returns {{el:HTMLElement, cerrar:Function, form:HTMLFormElement}}
   */
  abrir({ modo, solicitud, fecha }) {
    const s = solicitud || {
      cliente: { nombre: '', email: '', telefono: '' }, estado: 'nueva', cobro: 'pendiente',
      tipo: '', fecha: fecha || '', invitados: '', ciudad: '', espacio: '', precio: '', notas: '', servicios: [],
    };
    const opcionesObj = (obj, sel) => Object.entries(obj)
      .map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${typeof v === 'string' ? v : v.label}</option>`).join('');

    const cuerpo = `
      <form id="form-evento" novalidate>
        <div class="form-section">Datos del cliente</div>
        <div class="form-grid">
          <div class="field c-3"><label>Nombre completo *</label><input class="input" name="nombre" placeholder="Ej. Laura García" value="${Utils.esc(s.cliente.nombre)}"></div>
          <div class="field c-3"><label>Correo electrónico *</label><input class="input" type="email" name="email" placeholder="nombre@email.com" value="${Utils.esc(s.cliente.email)}"></div>
          <div class="field c-3"><label>Teléfono *</label><input class="input" name="telefono" placeholder="+34 600 000 000" value="${Utils.esc(s.cliente.telefono)}"></div>
          <div class="field c-3"><label>Estado</label><select class="select" name="estado">${opcionesObj(Catalogo.ESTADOS, s.estado)}</select></div>
          <div class="field c-3"><label>Estado del cobro</label><select class="select" name="cobro">${opcionesObj(Catalogo.COBROS, s.cobro)}</select></div>
        </div>

        <div class="form-section">Datos del evento</div>
        <div class="form-grid">
          <div class="field c-2"><label>Tipo de evento *</label><select class="select" name="tipo">${FormView.opciones(Catalogo.TIPOS_EVENTO, s.tipo)}</select></div>
          <div class="field c-2"><label>Fecha *</label><input class="input" type="date" name="fecha" value="${Utils.esc(s.fecha)}"></div>
          <div class="field c-2"><label>Invitados *</label><select class="select" name="invitados">${FormView.opciones(Catalogo.INVITADOS, s.invitados)}</select></div>
          <div class="field c-2"><label>Ciudad *</label><input class="input" name="ciudad" placeholder="Ej. Madrid" value="${Utils.esc(s.ciudad)}"></div>
          <div class="field c-2"><label>Tipo de espacio *</label><select class="select" name="espacio">${FormView.opciones(Catalogo.ESPACIOS, s.espacio)}</select></div>
          <div class="field c-2"><label>Presupuesto estimado (€) *</label><input class="input" type="number" min="0" step="10" name="precio" placeholder="Ej. 2500" value="${Utils.esc(s.precio)}"></div>
          <div class="field c-6"><label>Notas</label><textarea class="textarea" name="notas" rows="2" placeholder="Lugar, horario e indicaciones especiales...">${Utils.esc(s.notas)}</textarea></div>
        </div>

        <div class="form-section">Servicios *</div>
        <div class="svc-chips" data-campo="servicios">
          ${Catalogo.SERVICIOS.map((def) => `
            <button type="button" class="svc-chip ${s.servicios.some((x) => x.id === def.id) ? 'is-selected' : ''}" data-servicio="${def.id}" aria-pressed="${s.servicios.some((x) => x.id === def.id)}">
              <span class="tone tone--${def.tono}">${Icons.get(def.icono)}</span>${Utils.esc(def.nombre)}
            </button>`).join('')}
        </div>

        <div class="form-section">Configuración técnica</div>
        <p class="tiny muted" style="margin:-4px 0 12px">Define las cantidades y variantes de los servicios seleccionados.</p>
        <div data-config></div>

        <div class="form-section">Fotos del lugar</div>
        <div data-fotos></div>
      </form>`;

    const modal = ModalView.abrir({
      eyebrow: modo === 'crear' ? 'Nuevo registro' : `Editar · ${s.id}`,
      titulo: modo === 'crear' ? 'Crear evento manual' : 'Editar evento',
      subtitulo: 'Los campos marcados con * son obligatorios.',
      cuerpo,
      pie: `<button type="button" class="btn--text" data-cerrar>Cancelar</button>
            <button type="submit" form="form-evento" class="btn btn--mint">${modo === 'crear' ? `Crear evento ${Icons.get('plus', 'icon icon--sm')}` : 'Guardar cambios'}</button>`,
    });

    const form = modal.el.querySelector('#form-evento');
    const configBox = form.querySelector('[data-config]');
    ServiciosConfigView.render(configBox, s.servicios);

    // Seleccionar / quitar servicios sin perder la configuración ya elegida
    form.querySelectorAll('[data-servicio]').forEach((chip) => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('is-selected');
        chip.setAttribute('aria-pressed', chip.classList.contains('is-selected'));
        const ids = Utils.$$('.svc-chip.is-selected', form).map((c) => c.dataset.servicio);
        ServiciosConfigView.render(configBox, ServiciosConfigView.combinar(ids, ServiciosConfigView.leer(configBox)));
      });
    });

    return { ...modal, form, fotos: form.querySelector('[data-fotos]') };
  },

  /** Lee el formulario y devuelve el objeto que entiende el modelo. */
  leer(form) {
    const d = FormView.leer(form);
    return {
      cliente: { nombre: d.nombre, email: d.email, telefono: d.telefono },
      estado: d.estado, cobro: d.cobro,
      tipo: d.tipo, fecha: d.fecha, invitados: d.invitados, ciudad: d.ciudad, espacio: d.espacio,
      precio: d.precio, notas: d.notas,
      servicios: ServiciosConfigView.leer(form.querySelector('[data-config]')),
    };
  },

  bindGuardar(form, handler) {
    form.addEventListener('submit', (e) => { e.preventDefault(); handler(EventoFormView.leer(form)); });
  },
};
