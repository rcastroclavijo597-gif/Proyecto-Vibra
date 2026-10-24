/* =========================================================
   VISTA · Crear presupuesto
   ========================================================= */

const PresupuestoView = {
  render(s, propuesta) {
    document.title = `Presupuesto ${s.id} · Vibra`;
    document.getElementById('eyebrow').textContent = `${s.id} · ${s.cliente.nombre}`;
    const enviada = propuesta.estado !== 'borrador';

    document.getElementById('presupuesto').innerHTML = `
      <section class="card budget__card">
        <div class="budget__head">
          <h2 class="h2">Conceptos</h2>
          <button class="budget__add" type="button" id="btn-anadir">${Icons.get('plus')} Añadir concepto</button>
        </div>
        <div id="conceptos"></div>
        <div class="budget__msg">
          <label for="mensaje">Mensaje para el cliente</label>
          <textarea class="textarea" id="mensaje" rows="3">${Utils.esc(propuesta.mensaje)}</textarea>
        </div>
      </section>

      <aside class="card card--dark summary">
        <div class="summary__label">Resumen</div>
        <div class="summary__row"><span>Subtotal</span><span id="r-subtotal"></span></div>
        <div class="summary__row"><span>IVA (21%)</span><span id="r-iva"></span></div>
        <div class="summary__total"><span>Total</span><strong id="r-total"></strong></div>
        <p class="summary__note">La propuesta será válida durante 15 días. El cliente podrá aceptarla desde su panel.</p>
        <button class="btn btn--mint" type="button" id="btn-enviar">${enviada ? 'Reenviar al cliente' : 'Enviar al cliente'} ${Icons.get('arrowRight', 'icon icon--sm')}</button>
        ${enviada ? `<p class="summary__status">${propuesta.estado === 'aceptada' ? 'El cliente aceptó esta propuesta' : 'Propuesta enviada · esperando respuesta'}</p>` : ''}
      </aside>`;

    PresupuestoView.renderConceptos(propuesta.conceptos);
  },

  renderConceptos(conceptos) {
    document.getElementById('conceptos').innerHTML = conceptos.map((c, i) => `
      <div class="concept" data-i="${i}">
        <div>
          <input class="concept__name" data-campo="nombre" value="${Utils.esc(c.nombre)}" placeholder="Nombre del concepto" aria-label="Concepto">
          <input class="concept__desc" data-campo="detalle" value="${Utils.esc(c.detalle)}" placeholder="Descripción breve" aria-label="Descripción">
        </div>
        <label class="price-input"><input type="number" min="0" step="10" data-campo="precio" value="${c.precio}" aria-label="Precio"><span>€</span></label>
        <button class="concept__remove" type="button" data-quitar title="Quitar concepto">${Icons.get('trash')}</button>
      </div>`).join('');
  },

  renderTotales({ subtotal, iva, total }) {
    document.getElementById('r-subtotal').textContent = Utils.euros(subtotal, { agrupar: true });
    document.getElementById('r-iva').textContent = Utils.euros(iva, { agrupar: true, decimales: iva % 1 !== 0 });
    document.getElementById('r-total').textContent = Utils.euros(total, { agrupar: true, decimales: true });
  },

  leer() {
    return {
      conceptos: Utils.$$('.concept').map((fila) => ({
        nombre: fila.querySelector('[data-campo=nombre]').value,
        detalle: fila.querySelector('[data-campo=detalle]').value,
        precio: Number(fila.querySelector('[data-campo=precio]').value) || 0,
      })),
      mensaje: document.getElementById('mensaje').value,
    };
  },

  enfocarUltimo() { Utils.$$('.concept__name').pop()?.focus(); },

  bind({ cambio, anadir, quitar, borrador, enviar }) {
    const cont = document.getElementById('presupuesto');
    cont.addEventListener('input', cambio);
    cont.addEventListener('click', (e) => {
      if (e.target.closest('#btn-anadir')) anadir();
      if (e.target.closest('#btn-enviar')) enviar();
      const q = e.target.closest('[data-quitar]');
      if (q) quitar(Number(q.closest('.concept').dataset.i));
    });
    document.getElementById('btn-borrador').addEventListener('click', borrador);
  },
};
