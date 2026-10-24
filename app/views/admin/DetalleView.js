/* =========================================================
   VISTA · Detalle de solicitud
   ========================================================= */

const DetalleView = {
  render(s) {
    document.title = `${s.id} · Vibra`;
    document.getElementById('eyebrow').textContent = `Solicitud ${s.id}`;
    document.getElementById('titulo').textContent = `${s.tipo} de ${s.cliente.nombre}`;
    const btnPres = document.getElementById('btn-presupuesto');
    btnPres.innerHTML = `${s.propuesta && s.propuesta.estado !== 'borrador' ? 'Ver presupuesto' : 'Crear presupuesto'} ${Icons.get('arrowRight', 'icon icon--sm')}`;

    const actividad = [
      { titulo: `Estado actual: ${Catalogo.ESTADOS[s.estado].label}`, etiqueta: 'Ahora', descripcion: 'El cliente puede ver este estado desde su panel.' },
      ...[...s.actividad].reverse().map((a) => ({
        titulo: a.titulo, descripcion: a.descripcion, etiqueta: a.inicial ? 'Registro inicial' : Utils.momento(a.fecha),
      })),
    ];
    const opcionesObj = (obj, sel) => Object.entries(obj)
      .map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${typeof v === 'string' ? v : v.label}</option>`).join('');

    document.getElementById('detalle').innerHTML = `
      <div class="detail__main">
        <section class="card">
          <div class="card__head card__head--line">
            <h2 class="h2">Información del evento</h2>
            ${TablaSolicitudesView.badge(s.estado)}
          </div>
          <div class="card__pad">
            <div class="facts">
              <div><div class="fact__label">Tipo</div><div class="fact__value">${Utils.esc(s.tipo)}</div></div>
              <div><div class="fact__label">Fecha</div><div class="fact__value">${Utils.fecha(s.fecha)}</div></div>
              <div><div class="fact__label">Invitados</div><div class="fact__value">${Utils.esc(s.invitados)}</div></div>
              <div><div class="fact__label">Espacio</div><div class="fact__value">${Utils.esc(s.espacio)}</div></div>
            </div>
            <div class="note-box">
              <div class="fact__label" style="margin:0">Notas del cliente</div>
              <p class="note-box__text">${s.notas ? Utils.esc(s.notas) : 'Sin notas.'}</p>
            </div>
          </div>
        </section>

        <section class="card card__pad">
          <h2 class="detail__section-title">Servicios solicitados</h2>
          <div class="svc-items">
            ${s.servicios.map((x) => {
              const def = Catalogo.servicio(x.id);
              return `<div class="svc-item">
                <span class="tone tone--${def.tono}">${Icons.get(def.icono)}</span>
                <div><div class="svc-item__name">${Utils.esc(def.nombre)}</div><div class="svc-item__detail">${Utils.esc(Catalogo.detalleServicio(x))}</div></div>
              </div>`;
            }).join('') || '<p class="muted small">Sin servicios.</p>'}
          </div>
        </section>

        <section class="card card__pad">
          <h2 class="detail__section-title">Fotos del lugar</h2>
          ${FotosView.galeria(s.fotos, 'El cliente no adjuntó fotos del lugar.')}
        </section>

        <section class="card card__pad">
          <h2 class="detail__section-title">Actividad</h2>
          <div class="timeline">
            ${actividad.map((a) => `
              <div class="timeline__item">
                <span class="timeline__dot">${Icons.get('check')}</span>
                <div>
                  <div class="timeline__title">${Utils.esc(a.titulo)}<small>${Utils.esc(a.etiqueta)}</small></div>
                  <div class="timeline__desc">${Utils.esc(a.descripcion)}</div>
                </div>
              </div>`).join('')}
          </div>
        </section>
      </div>

      <aside class="detail__side">
        <section class="card card--dark client-card">
          <div class="client-card__label">Cliente</div>
          <div class="client-card__who">
            <span class="avatar avatar--mint avatar--lg">${Utils.esc(Utils.iniciales(s.cliente.nombre))}</span>
            <div><strong>${Utils.esc(s.cliente.nombre)}</strong><span>${s.origen === 'manual' ? 'Evento manual' : 'Solicitud web'}</span></div>
          </div>
          <div class="client-card__data">
            <span>${Utils.esc(s.cliente.email)}</span>
            <span>${Utils.esc(s.cliente.telefono || '—')}</span>
            <span>${Utils.esc(s.ciudad || '—')}</span>
          </div>
          <button class="btn btn--ghost-light" type="button" id="btn-mensaje">Enviar mensaje${s.mensajes?.length ? ` · ${s.mensajes.length}` : ''}</button>
        </section>

        <form class="card manage" id="form-gestion" novalidate>
          <div class="manage__title">Gestión administrativa</div>
          <div class="field"><label for="g-estado">Estado de la solicitud</label>
            <select class="select" id="g-estado" name="estado">${opcionesObj(Catalogo.ESTADOS, s.estado)}</select></div>
          <div class="field"><label for="g-precio">Precio acordado (€)</label>
            <input class="input" id="g-precio" name="precio" type="number" min="0" step="0.01" value="${s.precio}"></div>
          <div class="field"><label for="g-cobro">Estado del cobro</label>
            <select class="select" id="g-cobro" name="cobro">${opcionesObj(Catalogo.COBROS, s.cobro)}</select></div>
          <button class="btn btn--mint" type="submit">Guardar gestión ${Icons.get('arrowRight', 'icon icon--sm')}</button>
          <p class="manage__note">El cliente recibirá el cambio de estado y precio en su panel.</p>
        </form>

        <section class="card card--danger danger-zone">
          <div class="danger-zone__title">Zona de eliminación</div>
          <p>Se solicitará confirmación antes de eliminar definitivamente la solicitud.</p>
          <button class="btn btn--danger" type="button" id="btn-eliminar">${Icons.get('trash', 'icon icon--sm')} Eliminar solicitud</button>
        </section>
      </aside>`;
  },

  renderNoEncontrada() {
    document.getElementById('eyebrow').textContent = 'Solicitud';
    document.getElementById('titulo').textContent = 'No encontramos esta solicitud';
    document.querySelector('.page-head__actions').hidden = true;
    document.getElementById('detalle').innerHTML = `
      <div class="card empty-state" style="grid-column:1/-1">
        <p>Puede que se haya eliminado o que el enlace no sea correcto.</p>
        <a class="btn btn--dark" href="${Utils.url('admin/solicitudes.html')}">Ver todas las solicitudes</a>
      </div>`;
  },

  leerGestion() {
    const d = FormView.leer(document.getElementById('form-gestion'));
    return { estado: d.estado, precio: Number(d.precio) || 0, cobro: d.cobro };
  },

  bindEditar(h) { document.getElementById('btn-editar').addEventListener('click', h); },
  bindPresupuesto(h) { document.getElementById('btn-presupuesto').addEventListener('click', h); },
  /** Los botones internos se vuelven a pintar, así que usamos delegación. */
  bindInternos({ guardar, eliminar, mensaje, verFoto }) {
    const cont = document.getElementById('detalle');
    cont.addEventListener('submit', (e) => { if (e.target.id === 'form-gestion') { e.preventDefault(); guardar(); } });
    cont.addEventListener('click', (e) => {
      if (e.target.closest('#btn-eliminar')) eliminar();
      if (e.target.closest('#btn-mensaje')) mensaje();
      const foto = e.target.closest('.galeria__item[data-foto-id]');
      if (foto) verFoto(foto.dataset.fotoId);
    });
  },
};
