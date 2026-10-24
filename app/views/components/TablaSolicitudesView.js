/* =========================================================
   VISTA · Tabla de solicitudes (Resumen y Solicitudes)
   ========================================================= */

const TablaSolicitudesView = {
  badge(estado) {
    return `<span class="badge badge--${estado}">${Catalogo.ESTADOS[estado].label}</span>`;
  },

  fila(s) {
    const n = s.servicios.length;
    const confirmada = s.estado === 'confirmada';
    return `
      <tr data-id="${s.id}">
        <td>
          <div class="cell-person">
            <span class="avatar">${Utils.esc(Utils.iniciales(s.cliente.nombre))}</span>
            <div>
              <div class="cell-person__name">${Utils.esc(s.cliente.nombre)}</div>
              <div class="cell-sub">${s.id.replace('-', ' · ')} · <a href="mailto:${Utils.esc(s.cliente.email)}">${Utils.esc(s.cliente.email)}</a></div>
            </div>
          </div>
        </td>
        <td>
          <div class="cell-title">${Utils.esc(s.tipo)}</div>
          <div class="cell-sub">${Utils.fecha(s.fecha)} · ${Utils.plural(n, 'servicio', 'servicios')}</div>
        </td>
        <td class="num">${Utils.euros(s.precio)}</td>
        <td>${TablaSolicitudesView.badge(s.estado)}</td>
        <td>
          <div class="actions">
            <button class="icon-btn" data-accion="alerta" title="Ver resumen en una alerta">${Icons.get('bell')}</button>
            <button class="icon-btn" data-accion="ver" title="Ver detalle">${Icons.get('eye')}</button>
            <button class="icon-btn" data-accion="editar" title="Editar">${Icons.get('edit')}</button>
            <button class="icon-btn" data-accion="eliminar" title="Eliminar">${Icons.get('trash')}</button>
            <button class="icon-btn icon-btn--dark" data-accion="presupuesto" title="${confirmada ? 'Evento ya confirmado' : 'Crear presupuesto'}" ${confirmada ? 'disabled' : ''}>${Icons.get('arrowRight')}</button>
          </div>
        </td>
      </tr>`;
  },

  /**
   * Muestra la alerta nativa del navegador (alert) con los datos principales
   * de una solicitud: cliente, tipo de evento, presupuesto y estado.
   */
  mostrarAlerta(s) {
    const presupuesto = Number(s.precio) > 0 ? Utils.euros(s.precio, { agrupar: true }) : 'Por definir';
    window.alert(
      `Cliente: ${s.cliente.nombre}\n` +
      `Tipo de evento: ${s.tipo}\n` +
      `Presupuesto: ${presupuesto}\n` +
      `Estado: ${Catalogo.ESTADOS[s.estado].label}`
    );
  },

  render(tbody, solicitudes, vacio = 'No hay solicitudes con este filtro.') {
    tbody.innerHTML = solicitudes.length
      ? solicitudes.map(TablaSolicitudesView.fila).join('')
      : `<tr><td colspan="5" class="table__empty">${vacio}</td></tr>`;
  },

  /** Delegación de eventos: handler(accion, id) */
  bindAcciones(tbody, handler) {
    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-accion]');
      if (!btn || btn.disabled) return;
      handler(btn.dataset.accion, btn.closest('tr').dataset.id);
    });
  },

  pintarFiltros(contenedor, activo) {
    Utils.$$('[data-filtro]', contenedor).forEach((b) => b.classList.toggle('is-active', b.dataset.filtro === activo));
  },

  bindFiltros(contenedor, handler) {
    contenedor.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filtro]');
      if (b) handler(b.dataset.filtro);
    });
  },
};
