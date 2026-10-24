/* =========================================================
   VISTA · Facturación (cobros pendientes / ingresos recibidos)
   ========================================================= */

const FacturacionView = {
  TEXTOS: {
    pendientes: {
      titulo: 'Cobros pendientes', lead: 'Consulta qué eventos tienen un importe pendiente y entra en su ficha para gestionarlo.',
      banner: 'Total por cobrar', clase: 'money-banner--pending', badge: 'pendiente', vacio: 'No hay cobros pendientes. ¡Todo al día!',
    },
    pagados: {
      titulo: 'Ingresos recibidos', lead: 'Revisa los eventos pagados y las ganancias registradas.',
      banner: 'Ganancias registradas', clase: 'money-banner--paid', badge: 'pagado', vacio: 'Todavía no hay eventos pagados.',
    },
  },

  render(vista, lista) {
    const t = FacturacionView.TEXTOS[vista];
    const total = lista.reduce((s, e) => s + (Number(e.precio) || 0), 0);
    document.getElementById('titulo').textContent = t.titulo;
    document.getElementById('lead').textContent = t.lead;
    Utils.$$('[data-vista]').forEach((b) => b.classList.toggle('is-active', b.dataset.vista === vista));

    document.getElementById('banner').className = `money-banner ${t.clase}`;
    document.getElementById('banner').innerHTML = `
      <div><div class="money-banner__label">${t.banner}</div><div class="money-banner__value">${Utils.euros(total)}</div></div>
      <div class="money-banner__count">${Utils.plural(lista.length, 'evento', 'eventos')}</div>`;

    document.getElementById('tabla').innerHTML = lista.length ? lista.map((s) => `
      <tr class="is-clickable" data-id="${s.id}">
        <td><div class="cell-person__name">${Utils.esc(s.cliente.nombre)}</div><div class="cell-sub">${s.id.replace('-', ' · ')} · ${Utils.esc(s.cliente.email)}</div></td>
        <td><div class="cell-title">${Utils.esc(s.tipo)}</div><div class="cell-sub">${Utils.fecha(s.fecha)}</div></td>
        <td class="num">${Utils.euros(s.precio)}</td>
        <td><span class="badge badge--${t.badge}">${Catalogo.COBROS[s.cobro]}</span></td>
        <td class="td-right">${Icons.get('chevronRight', 'icon chev')}</td>
      </tr>`).join('') : `<tr><td colspan="5" class="table__empty">${t.vacio}</td></tr>`;
  },

  bindVista(handler) {
    document.getElementById('tabs').addEventListener('click', (e) => {
      const b = e.target.closest('[data-vista]');
      if (b) handler(b.dataset.vista);
    });
  },
  bindFila(handler) {
    document.getElementById('tabla').addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-id]');
      if (tr) handler(tr.dataset.id);
    });
  },
};

/* =========================================================
   VISTA · Clientes
   ========================================================= */
const ClientesView = {
  render(clientes, hayClientes = true) {
    document.getElementById('tabla').innerHTML = clientes.length ? clientes.map((c) => `
      <tr class="is-clickable" data-email="${Utils.esc(c.email)}">
        <td>
          <div class="cell-person">
            <span class="avatar">${Utils.esc(Utils.iniciales(c.nombre))}</span>
            <div><div class="cell-person__name">${Utils.esc(c.nombre)}</div><div class="cell-sub">${Utils.esc(c.email)}</div></div>
          </div>
        </td>
        <td class="small strong">${Utils.plural(c.eventos, 'evento', 'eventos')}</td>
        <td class="num">${Utils.euros(c.facturacion, { decimales: true, agrupar: true })}</td>
        <td class="td-right">${Icons.get('chevronRight', 'icon chev')}</td>
      </tr>`).join('') : `<tr><td colspan="4" class="table__empty">${hayClientes ? 'No hay clientes que coincidan con la búsqueda.' : 'Todavía no hay clientes. Pulsa “Añadir cliente” o espera a que alguien se registre.'}</td></tr>`;
  },

  abrirAlta() {
    return ModalView.abrir({
      eyebrow: 'Base de datos', titulo: 'Añadir cliente', tamano: 'sm',
      cuerpo: `
        <form id="form-cliente" class="stack" novalidate>
          <div class="field"><label>Nombre completo *</label><input class="input" name="nombre" placeholder="Ej. Laura García"></div>
          <div class="field"><label>Correo electrónico *</label><input class="input" type="email" name="email" placeholder="nombre@email.com"></div>
          <div class="grid-2">
            <div class="field"><label>Teléfono</label><input class="input" name="telefono" placeholder="+34 600 000 000"></div>
            <div class="field"><label>Ciudad</label><input class="input" name="ciudad" placeholder="Ej. Madrid"></div>
          </div>
        </form>`,
      pie: `<button class="btn--text" type="button" data-cerrar>Cancelar</button>
            <button class="btn btn--mint" type="submit" form="form-cliente">Guardar cliente ${Icons.get('plus', 'icon icon--sm')}</button>`,
    });
  },

  bindBuscar(h) { document.getElementById('buscar').addEventListener('input', (e) => h(e.target.value)); },
  bindAnadir(h) { document.getElementById('btn-crear').addEventListener('click', h); },
  bindFila(h) {
    document.getElementById('tabla').addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-email]');
      if (tr) h(tr.dataset.email);
    });
  },
};
