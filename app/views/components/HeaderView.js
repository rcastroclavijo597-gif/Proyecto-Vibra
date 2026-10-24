/* =========================================================
   VISTA · Cabeceras (administración y cliente) y logo
   ========================================================= */

const HeaderView = {
  logo(claro = false) {
    return `<a class="logo ${claro ? 'logo--light' : ''}" href="${Utils.url('index.html')}">
      <span class="logo__mark">${Icons.get('logo')}</span>vibra</a>`;
  },

  TABS: [
    { id: 'resumen', label: 'Resumen', href: 'admin/resumen.html' },
    { id: 'solicitudes', label: 'Solicitudes', href: 'admin/solicitudes.html' },
    { id: 'calendario', label: 'Calendario', href: 'admin/calendario.html' },
    { id: 'facturacion', label: 'Facturación', href: 'admin/facturacion.html' },
    { id: 'clientes', label: 'Clientes', href: 'admin/clientes.html' },
  ],

  /** Cabecera oscura del panel de administración. */
  renderAdmin(contenedor, { activo, usuario }) {
    contenedor.innerHTML = `
      <header class="admin-header">
        <div class="container">
          <div class="admin-header__bar">
            <div class="admin-header__brand">${HeaderView.logo(true)}<span class="pill-tag">Administración</span></div>
            <div class="admin-header__user">
              <button class="admin-header__logout" type="button" data-logout>Cerrar sesión</button>
              <span class="avatar avatar--mint" title="${Utils.esc(usuario.email)}">${Utils.iniciales(usuario.nombre)}</span>
            </div>
          </div>
          <nav class="admin-nav" aria-label="Secciones">
            ${HeaderView.TABS.map((t) => `<a href="${Utils.url(t.href)}" class="${t.id === activo ? 'is-active' : ''}">${t.label}</a>`).join('')}
          </nav>
        </div>
      </header>`;
  },

  /**
   * Cabecera clara del área de clientes.
   * variante: 'saludo' (paso 1), 'pasos' (pasos 2 y 3) o 'panel'
   */
  renderCliente(contenedor, { variante, paso = 1, usuario }) {
    const nombre = usuario ? usuario.nombre : 'creador';
    const derecha = {
      saludo: `Hola, ${Utils.esc(nombre)}`,
      pasos: 'Tu nuevo evento',
      panel: 'Mi cuenta',
    }[variante];
    const avatarClase = variante === 'panel' ? 'avatar avatar--purple' : 'avatar';

    contenedor.innerHTML = `
      <header class="client-header ${variante === 'panel' ? 'client-header--white' : ''}">
        <div class="container">
          <div class="client-header__bar">
            ${HeaderView.logo()}
            <div class="client-header__user">
              <button type="button" data-menu aria-haspopup="true">${derecha}<span class="${avatarClase}">${Icons.get('user')}</span></button>
              <div class="dropdown" data-dropdown hidden>
                ${usuario ? `<div class="dropdown__head"><strong>${Utils.esc(UsuarioModel.nombreCompleto(usuario))}</strong><span>${Utils.esc(usuario.email)}</span></div>` : ''}
                <a href="${Utils.url('cliente/panel.html')}">${Icons.get('calendar', 'icon icon--sm')}Mis eventos</a>
                <a href="${Utils.url('cliente/servicios.html?nuevo=1')}">${Icons.get('plus', 'icon icon--sm')}Nuevo evento</a>
                <button type="button" data-logout>${Icons.get('logout', 'icon icon--sm')}Cerrar sesión</button>
              </div>
            </div>
          </div>
          ${variante === 'pasos' ? `<div class="steps-bar">${[1, 2, 3].map((n) => `<span class="${n <= paso ? 'is-done' : ''}"></span>`).join('')}</div>` : ''}
        </div>
      </header>`;

    const boton = contenedor.querySelector('[data-menu]');
    const menu = contenedor.querySelector('[data-dropdown]');
    boton.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) menu.hidden = true; });
  },

  bindLogout(contenedor, handler) {
    contenedor.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', handler));
  },
};
