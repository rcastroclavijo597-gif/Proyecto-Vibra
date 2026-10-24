/* =========================================================
   VISTA · Modal genérico, confirmaciones y notificaciones
   ========================================================= */

const ModalView = {
  /**
   * Abre un modal.
   * @param {{eyebrow?:string, titulo:string, subtitulo?:string, cuerpo:string, pie?:string, tamano?:'sm'|''}} op
   * @returns {{el:HTMLElement, cerrar:Function}}
   */
  abrir(op) {
    const backdrop = Utils.html(`
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal ${op.tamano === 'sm' ? 'modal--sm' : ''}">
          <div class="modal__head">
            <div>
              ${op.eyebrow ? `<span class="eyebrow">${Utils.esc(op.eyebrow)}</span>` : ''}
              <h2 class="modal__title">${Utils.esc(op.titulo)}</h2>
              ${op.subtitulo ? `<p class="lead" style="margin-top:2px;font-size:11px">${Utils.esc(op.subtitulo)}</p>` : ''}
            </div>
            <button class="modal__close" type="button" data-cerrar aria-label="Cerrar">${Icons.get('x')}</button>
          </div>
          <div class="modal__body">${op.cuerpo}</div>
          ${op.pie ? `<div class="modal__foot">${op.pie}</div>` : ''}
        </div>
      </div>`);

    const cerrar = () => {
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      op.alCerrar?.();
    };
    const onKey = (e) => { if (e.key === 'Escape') cerrar(); };

    backdrop.addEventListener('mousedown', (e) => { if (e.target === backdrop) cerrar(); });
    backdrop.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', cerrar));
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.body.appendChild(backdrop);
    const primerCampo = backdrop.querySelector('input:not([type=hidden]), textarea');
    if (primerCampo && op.autofoco !== false) setTimeout(() => primerCampo.focus(), 50);
    return { el: backdrop, cerrar };
  },

  /** Confirmación con promesa: resuelve true si el usuario acepta. */
  confirmar({ titulo, mensaje, aceptar = 'Aceptar', peligro = false }) {
    return new Promise((resolve) => {
      let decidido = false;
      const m = ModalView.abrir({
        titulo,
        tamano: 'sm',
        cuerpo: `<p class="confirm-text">${mensaje}</p>`,
        pie: `<button class="btn--text" data-cerrar type="button">Cancelar</button>
              <button class="btn ${peligro ? 'btn--danger-solid' : 'btn--mint'}" data-ok type="button">${Utils.esc(aceptar)}</button>`,
        alCerrar: () => { if (!decidido) resolve(false); },
      });
      m.el.querySelector('[data-ok]').addEventListener('click', () => { decidido = true; m.cerrar(); resolve(true); });
    });
  },
};

const ToastView = {
  mostrar(mensaje, tipo = 'ok') {
    let cont = document.querySelector('.toasts');
    if (!cont) {
      cont = Utils.html('<div class="toasts" aria-live="polite"></div>');
      document.body.appendChild(cont);
    }
    const t = Utils.html(`<div class="toast ${tipo === 'error' ? 'toast--error' : ''}"><span class="toast__dot"></span>${Utils.esc(mensaje)}</div>`);
    cont.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; }, 2600);
    setTimeout(() => t.remove(), 3000);
  },
  /** Deja un mensaje para mostrarlo en la siguiente página. */
  flash(mensaje) { sessionStorage.setItem('vibra_flash', mensaje); },
  mostrarFlash() {
    const m = sessionStorage.getItem('vibra_flash');
    if (m) { sessionStorage.removeItem('vibra_flash'); ToastView.mostrar(m); }
  },
};

/** Ayudas para mostrar errores de validación en formularios. */
const FormView = {
  limpiarErrores(form) {
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    form.querySelectorAll('.field__error').forEach((el) => el.remove());
  },
  mostrarErrores(form, campos = {}) {
    FormView.limpiarErrores(form);
    // Al corregir un campo, su mensaje de error desaparece
    if (!form.dataset.limpiezaActiva) {
      form.dataset.limpiezaActiva = '1';
      const limpiar = (e) => {
        const campo = e.target.closest('.field, [data-campo]');
        if (!campo) return;
        campo.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
        campo.querySelectorAll('.field__error').forEach((el) => el.remove());
      };
      form.addEventListener('input', limpiar);
      form.addEventListener('change', limpiar);
      form.addEventListener('click', (e) => { if (e.target.closest('[data-tipo], [data-servicio]')) limpiar(e); });
    }
    let primero = null;
    Object.entries(campos).forEach(([nombre, msg]) => {
      const input = form.querySelector(`[name="${nombre}"]`);
      const contenedor = form.querySelector(`[data-campo="${nombre}"]`) || input?.closest('.field');
      if (input) input.classList.add('is-invalid');
      if (contenedor) contenedor.insertAdjacentHTML('beforeend', `<span class="field__error">${Utils.esc(msg)}</span>`);
      if (!primero) primero = input && input.type !== 'hidden' ? input : contenedor;
    });
    primero?.focus?.();
    primero?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  },
  /** Lee todos los campos con name de un formulario. */
  leer(form) {
    const datos = {};
    form.querySelectorAll('[name]').forEach((el) => {
      if (el.type === 'checkbox') datos[el.name] = el.checked;
      else datos[el.name] = el.value;
    });
    return datos;
  },
  opciones(lista, seleccion, placeholder = 'Seleccionar') {
    return `<option value="">${placeholder}</option>` +
      lista.map((o) => `<option value="${Utils.esc(o)}" ${o === seleccion ? 'selected' : ''}>${Utils.esc(o)}</option>`).join('');
  },
};
