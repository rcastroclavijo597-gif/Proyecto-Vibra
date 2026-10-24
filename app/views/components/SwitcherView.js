/* =========================================================
   VISTA · Navegador de vistas (píldora inferior izquierda)
   Atajo de demostración para saltar entre pantallas.
   ========================================================= */

const SwitcherView = {
  PAGINAS: [
    { grupo: 'Público', items: [
      { id: 'inicio', label: 'Inicio', href: 'index.html' },
      { id: 'registro', label: 'Crear cuenta', href: 'registro.html' },
      { id: 'login', label: 'Iniciar sesión', href: 'login.html' },
    ] },
    { grupo: 'Cliente', items: [
      { id: 'servicios', label: 'Paso 1 · Servicios', href: 'cliente/servicios.html' },
      { id: 'detalles', label: 'Paso 2 · Detalles', href: 'cliente/detalles.html' },
      { id: 'revisar', label: 'Paso 3 · Revisar', href: 'cliente/revisar.html' },
      { id: 'panel', label: 'Panel del cliente', href: 'cliente/panel.html' },
    ] },
    { grupo: 'Administración', items: [
      { id: 'resumen', label: 'Panel de control', href: 'admin/resumen.html' },
      { id: 'solicitudes', label: 'Solicitudes', href: 'admin/solicitudes.html' },
      { id: 'calendario', label: 'Calendario operativo', href: 'admin/calendario.html' },
      { id: 'facturacion', label: 'Facturación', href: 'admin/facturacion.html' },
      { id: 'clientes', label: 'Clientes', href: 'admin/clientes.html' },
    ] },
  ],

  render({ paginaActual, titulo }) {
    const el = Utils.html(`
      <div class="switcher">
        <div class="switcher__panel" hidden>
          ${SwitcherView.PAGINAS.map((g) => `
            <div class="switcher__group">${g.grupo}</div>
            ${g.items.map((i) => `<a href="${Utils.url(i.href)}" class="${i.id === paginaActual ? 'is-current' : ''}">${i.label}</a>`).join('')}
          `).join('')}
          <div class="switcher__sep"></div>
          <button type="button" data-accion="reiniciar">Borrar todos los datos</button>
        </div>
        <button class="switcher__toggle" type="button" aria-expanded="false">
          <span class="switcher__dot">${Icons.get('logo')}</span>${Utils.esc(titulo)}${Icons.get('chevronUp')}
        </button>
      </div>`);
    document.body.appendChild(el);

    const panel = el.querySelector('.switcher__panel');
    const toggle = el.querySelector('.switcher__toggle');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
      el.classList.toggle('is-open', !panel.hidden);
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
    });
    document.addEventListener('click', (e) => {
      if (!el.contains(e.target)) { panel.hidden = true; el.classList.remove('is-open'); }
    });
    return el;
  },

  bindAcciones(el, handler) {
    el.querySelectorAll('[data-accion]').forEach((b) => b.addEventListener('click', () => handler(b.dataset.accion)));
  },
};
