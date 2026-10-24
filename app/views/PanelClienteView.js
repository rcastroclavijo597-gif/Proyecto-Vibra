/* =========================================================
   VISTA · Panel del cliente ("Todo bajo control.")
   ========================================================= */

const PanelClienteView = {
  render(principal, otros) {
    const cont = document.getElementById('evento-principal');
    if (!principal) {
      cont.innerHTML = `
        <div class="card empty-state">
          <span class="tone tone--purple" style="width:40px;height:40px;margin:0 auto 14px">${Icons.get('calendar')}</span>
          <h2 class="h2">Aún no tienes eventos</h2>
          <p>Cuéntanos qué necesitas y prepararemos una propuesta a tu medida.</p>
          <a class="btn btn--mint" href="${Utils.url('cliente/servicios.html?nuevo=1')}">Crear mi primer evento ${Icons.get('arrowRight', 'icon icon--sm')}</a>
        </div>`;
      document.getElementById('otros-eventos').innerHTML = '';
      return;
    }

    const s = principal;
    const est = Catalogo.ESTADOS[s.estado];
    const precioDefinido = ['propuesta', 'confirmada'].includes(s.estado) && s.precio > 0;
    const acciones = [];
    if (s.estado === 'nueva') acciones.push(`<button class="btn btn--outline" data-accion="editar">${Icons.get('edit')} Editar datos</button>`);
    if (s.propuesta && ['enviada', 'aceptada'].includes(s.propuesta.estado)) {
      acciones.push(`<button class="btn ${s.estado === 'propuesta' ? 'btn--mint' : 'btn--outline'}" data-accion="propuesta">${s.estado === 'propuesta' ? 'Ver propuesta' : 'Ver detalle'}</button>`);
    }

    cont.innerHTML = `
      <article class="card next-event" data-id="${s.id}">
        <div class="next-event__head">
          <span class="tone tone--purple">${Icons.get('calendar')}</span>
          <div>
            <div class="label-cap">Próximo evento</div>
            <div class="next-event__title">${Utils.esc(s.tipo)}</div>
          </div>
          ${TablaSolicitudesView.badge(s.estado)}
        </div>
        <div class="next-event__body">
          <div class="facts">
            <div><div class="fact__label">Fecha</div><div class="fact__value">${Utils.fecha(s.fecha)}</div></div>
            <div><div class="fact__label">Invitados</div><div class="fact__value">${Utils.esc(s.invitados)}</div></div>
            <div><div class="fact__label">Espacio</div><div class="fact__value">${Utils.esc(s.espacio)}</div></div>
            <div><div class="fact__label">Precio</div><div class="fact__value">${precioDefinido ? Utils.euros(s.precio, { agrupar: true }) : 'Por definir'}</div></div>
          </div>
          ${s.fotos?.length ? `<div class="next-event__fotos"><div class="fact__label">Fotos del lugar</div>${FotosView.galeria(s.fotos)}</div>` : ''}
          <div class="status-box">
            <div>
              <strong>${est.titulo}</strong>
              <p>${est.mensajeCliente}</p>
            </div>
            ${acciones.length ? `<div class="status-box__actions">${acciones.join('')}</div>` : ''}
          </div>
        </div>
      </article>`;

    document.getElementById('otros-eventos').innerHTML = otros.length ? `
      <div class="card other-events">
        <div class="other-events__title">Tus otros eventos</div>
        <div class="table-wrap">
          <table class="table">
            <tbody>
              ${otros.map((o) => `
                <tr class="is-clickable" data-ver="${o.id}">
                  <td><div class="cell-title">${Utils.esc(o.tipo)}</div><div class="cell-sub">${o.id} · ${Utils.fecha(o.fecha)}</div></td>
                  <td>${TablaSolicitudesView.badge(o.estado)}</td>
                  <td class="td-right">${Icons.get('chevronRight', 'icon chev')}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>` : '';
  },

  bindAcciones(handler) {
    document.getElementById('evento-principal').addEventListener('click', (e) => {
      const b = e.target.closest('[data-accion]');
      if (b) handler(b.dataset.accion, b.closest('[data-id]').dataset.id);
    });
    document.getElementById('otros-eventos').addEventListener('click', (e) => {
      const fila = e.target.closest('[data-ver]');
      if (fila) handler('seleccionar', fila.dataset.ver);
    });
  },

  bindVerFoto(handler) { FotosView.bindGaleria(document.getElementById('evento-principal'), handler); },

  bindConversacion(handler) {
    document.getElementById('abrir-conversacion').addEventListener('click', (e) => { e.preventDefault(); handler(); });
  },

  /** Modal con la propuesta enviada por el administrador. */
  abrirPropuesta(s, alAceptar) {
    const t = SolicitudModel.totalesPropuesta(s.propuesta);
    const pendiente = s.estado === 'propuesta';
    const modal = ModalView.abrir({
      eyebrow: `Propuesta · ${s.id}`,
      titulo: `${s.tipo} · ${Utils.fecha(s.fecha)}`,
      autofoco: false,
      cuerpo: `
        ${s.propuesta.mensaje ? `<div class="proposal-msg">${Utils.esc(s.propuesta.mensaje)}</div>` : ''}
        <ul class="proposal-list">
          ${s.propuesta.conceptos.map((c) => `<li><div>${Utils.esc(c.nombre)}<span>${Utils.esc(c.detalle || '')}</span></div><div>${Utils.euros(c.precio, { agrupar: true })}</div></li>`).join('')}
        </ul>
        <div class="proposal-totals">
          <div><span>Subtotal</span><span>${Utils.euros(t.subtotal, { agrupar: true })}</span></div>
          <div><span>IVA (21%)</span><span>${Utils.euros(t.iva, { agrupar: true, decimales: true })}</span></div>
          <div class="proposal-total"><span>Total</span><strong>${Utils.euros(t.total, { agrupar: true, decimales: true })}</strong></div>
        </div>`,
      pie: pendiente
        ? `<button class="btn--text" data-cerrar type="button">Ahora no</button><button class="btn btn--mint" data-aceptar type="button">Aceptar propuesta ${Icons.get('check', 'icon icon--sm')}</button>`
        : `<button class="btn btn--outline" data-cerrar type="button">Cerrar</button>`,
    });
    modal.el.querySelector('[data-aceptar]')?.addEventListener('click', () => { modal.cerrar(); alAceptar(); });
  },
};
