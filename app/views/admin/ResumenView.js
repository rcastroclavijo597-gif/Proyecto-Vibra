/* =========================================================
   VISTA · Panel de control (Resumen)
   ========================================================= */

const ResumenView = {
  renderSaludo(usuario) {
    document.getElementById('saludo').textContent = `${Utils.saludo()}, ${usuario.nombre}.`;
  },

  renderStats(st) {
    const tarjeta = (tono, icono, label, valor, link, href) => `
      <div class="card stat">
        <span class="tone tone--${tono}">${Icons.get(icono)}</span>
        <span class="stat__label">${label}</span>
        <span class="stat__value">${valor}</span>
        <a class="stat__link" href="${Utils.url(href)}">${link} ${Icons.get('arrowRight')}</a>
      </div>`;
    document.getElementById('stats').innerHTML = [
      tarjeta('purple', 'user', 'Solicitudes nuevas', st.nuevas, 'Ver solicitudes sin revisar', 'admin/solicitudes.html?estado=nueva'),
      tarjeta('teal', 'calendar', 'Eventos activos', st.activas, 'Ver fechas en el calendario', 'admin/calendario.html'),
      tarjeta('orange', 'music', 'Pendiente de cobro', Utils.euros(st.pendienteCobro), Utils.plural(st.eventosPendientes, 'evento pendiente', 'eventos pendientes'), 'admin/facturacion.html?vista=pendientes'),
      tarjeta('blue', 'logo', 'Facturación mensual', Utils.euros(st.facturado), Utils.plural(st.eventosPagados, 'evento pagado', 'eventos pagados'), 'admin/facturacion.html?vista=pagados'),
    ].join('');
  },

  renderTabla(solicitudes, filtro, vacio) {
    TablaSolicitudesView.render(document.getElementById('tabla'), solicitudes, vacio);
    TablaSolicitudesView.pintarFiltros(document.getElementById('filtros'), filtro);
  },

  bindFiltros(handler) { TablaSolicitudesView.bindFiltros(document.getElementById('filtros'), handler); },
  bindAcciones(handler) { TablaSolicitudesView.bindAcciones(document.getElementById('tabla'), handler); },
  bindCrear(handler) { document.getElementById('btn-crear').addEventListener('click', handler); },
};

/* =========================================================
   VISTA · Listado completo de solicitudes
   ========================================================= */
const SolicitudesView = {
  render(solicitudes, filtro, total) {
    TablaSolicitudesView.render(document.getElementById('tabla'), solicitudes,
      total ? 'No se encontraron solicitudes.' : 'Todavía no hay solicitudes. Crea un evento manual o espera a que un cliente envíe una.');
    TablaSolicitudesView.pintarFiltros(document.getElementById('filtros'), filtro);
    document.getElementById('contador').textContent = `${Utils.plural(solicitudes.length, 'solicitud', 'solicitudes')} de ${total}`;
  },
  setBusqueda(texto) { document.getElementById('buscar').value = texto; },
  bindBuscar(handler) { document.getElementById('buscar').addEventListener('input', (e) => handler(e.target.value)); },
  bindFiltros(handler) { TablaSolicitudesView.bindFiltros(document.getElementById('filtros'), handler); },
  bindAcciones(handler) { TablaSolicitudesView.bindAcciones(document.getElementById('tabla'), handler); },
  bindCrear(handler) { document.getElementById('btn-crear').addEventListener('click', handler); },
};
