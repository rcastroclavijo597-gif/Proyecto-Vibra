/* =========================================================
   VISTA · Asistente de solicitud (pasos 1, 2 y 3)
   ========================================================= */

const WizardView = {
  /* ---------------- Paso 1 · Servicios ---------------- */
  renderServicios(seleccion) {
    const ids = seleccion.map((s) => s.id);
    document.getElementById('servicios').innerHTML = Catalogo.SERVICIOS.map((def) => `
      <button type="button" class="service ${ids.includes(def.id) ? 'is-selected' : ''}" data-servicio="${def.id}" aria-pressed="${ids.includes(def.id)}">
        <span class="service__radio">${Icons.get('check')}</span>
        <span class="tone tone--${def.tono}">${Icons.get(def.icono)}</span>
        <h3 class="service__name">${Utils.esc(def.nombre)}</h3>
        <p class="service__desc">${Utils.esc(def.descripcion)}</p>
      </button>`).join('');

    const small = document.getElementById('seleccion-titulo');
    const strong = document.getElementById('seleccion-texto');
    if (!ids.length) {
      small.textContent = 'Aún no has seleccionado servicios';
      strong.textContent = 'Tu evento empieza a tomar forma.';
    } else {
      small.textContent = ids.length === 1 ? '1 servicio seleccionado' : `${ids.length} servicios seleccionados`;
      strong.textContent = ids.map((id) => Catalogo.servicio(id).nombre).join(', ');
    }
  },

  bindServicio(handler) {
    document.getElementById('servicios').addEventListener('click', (e) => {
      const card = e.target.closest('[data-servicio]');
      if (card) handler(card.dataset.servicio);
    });
  },

  bindContinuar(handler) { document.getElementById('btn-continuar').addEventListener('click', handler); },

  /* ---------------- Paso 2 · Detalles ---------------- */
  form() { return document.getElementById('form-detalles'); },

  renderDetalles(b) {
    const form = WizardView.form();
    // Tipo de evento (botones)
    form.querySelector('[data-tipos]').innerHTML = Catalogo.TIPOS_EVENTO.map((t) => `
      <button type="button" class="choice ${b.tipo === t ? 'is-selected' : ''}" data-tipo="${Utils.esc(t)}" aria-pressed="${b.tipo === t}">${Utils.esc(t)}</button>`).join('');
    form.querySelector('[name=tipo]').value = b.tipo;
    form.fecha.value = b.fecha;
    form.fecha.min = b.editandoId ? '' : Utils.hoyISO();
    form.invitados.innerHTML = FormView.opciones(Catalogo.INVITADOS, b.invitados, 'Selecciona una opción');
    form.ciudad.value = b.ciudad;
    form.espacio.innerHTML = FormView.opciones(Catalogo.ESPACIOS, b.espacio, 'Selecciona una opción');
    form.notas.value = b.notas;
    ServiciosConfigView.render(form.querySelector('[data-config]'), b.servicios);
    WizardView.renderFotos(b.fotos);
    if (b.editandoId) {
      document.getElementById('volver-servicios').innerHTML = `${Icons.get('arrowLeft')} Volver a servicios · editando ${Utils.esc(b.editandoId)}`;
    }
  },

  /* Fotos del lugar */
  contFotos() { return WizardView.form().querySelector('[data-fotos]'); },
  renderFotos(fotos) { FotosView.renderCampo(WizardView.contFotos(), fotos); },
  fotosOcupado(estado) { FotosView.ocupado(WizardView.contFotos(), estado); },
  bindFotos(handlers) { FotosView.bindCampo(WizardView.contFotos(), handlers); },

  marcarTipo(tipo) {
    const form = WizardView.form();
    form.querySelector('[name=tipo]').value = tipo;
    Utils.$$('[data-tipo]', form).forEach((b) => {
      const activo = b.dataset.tipo === tipo;
      b.classList.toggle('is-selected', activo);
      b.setAttribute('aria-pressed', activo);
    });
    FormView.limpiarErrores(form.querySelector('[data-campo=tipo]'));
  },

  leerDetalles() {
    const form = WizardView.form();
    const d = FormView.leer(form);
    return {
      tipo: d.tipo, fecha: d.fecha, invitados: d.invitados, ciudad: d.ciudad, espacio: d.espacio, notas: d.notas,
      servicios: ServiciosConfigView.leer(form.querySelector('[data-config]')),
    };
  },

  bindTipo(handler) {
    WizardView.form().querySelector('[data-tipos]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tipo]');
      if (b) handler(b.dataset.tipo);
    });
  },

  bindCambios(handler) {
    const form = WizardView.form();
    form.addEventListener('input', handler);
    form.addEventListener('change', handler);
  },

  bindRevisar(handler) {
    WizardView.form().addEventListener('submit', (e) => { e.preventDefault(); handler(); });
  },

  mostrarErrores(campos) { FormView.mostrarErrores(WizardView.form(), campos); },

  /* ---------------- Paso 3 · Revisar ---------------- */
  renderResumen(b, usuario) {
    const filas = [
      ['Celebración', Utils.esc(b.tipo)],
      ['Fecha', Utils.fecha(b.fecha)],
      ['Invitados', Utils.esc(b.invitados)],
      ['Ciudad', Utils.esc(b.ciudad)],
      ['Espacio', Utils.esc(b.espacio)],
      ['Servicios', `<div class="svc-items" style="margin-top:2px">${b.servicios.map((x) => {
        const def = Catalogo.servicio(x.id);
        return `<div class="svc-item"><span class="tone tone--${def.tono}">${Icons.get(def.icono)}</span>
          <div><div class="svc-item__name">${Utils.esc(def.nombre)}</div><div class="svc-item__detail">${Utils.esc(Catalogo.detalleServicio(x))}</div></div></div>`;
      }).join('')}</div>`],
      ['Fotos del lugar', FotosView.galeria(b.fotos, 'Sin fotos')],
      ['Notas', b.notas ? Utils.esc(b.notas) : '<span class="muted">Sin notas</span>'],
      ['Contacto', `${Utils.esc(UsuarioModel.nombreCompleto(usuario))}<br><span class="muted small">${Utils.esc(usuario.email)} · ${Utils.esc(usuario.telefono || '')}</span>`],
    ];
    document.getElementById('resumen').innerHTML = filas
      .map(([k, v]) => `<div class="review__row"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    document.getElementById('btn-enviar').innerHTML = b.editandoId
      ? `Guardar cambios ${Icons.get('check', 'icon icon--sm')}`
      : `Enviar solicitud ${Icons.get('arrowRight', 'icon icon--sm')}`;
  },

  bindEnviar(handler) { document.getElementById('btn-enviar').addEventListener('click', handler); },
  bindVerFoto(handler) { FotosView.bindGaleria(document.getElementById('resumen'), handler); },
};
