/* =========================================================
   VISTA · Calendario operativo
   ========================================================= */

const CalendarioView = {
  DIAS: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],

  /**
   * @param {number} anio
   * @param {number} mes 0-11
   * @param {object[]} eventos solicitudes que caen en ese mes (y en los días de relleno)
   */
  render(anio, mes, eventos) {
    document.getElementById('mes-titulo').textContent = `${Utils.MESES[mes]} ${anio}`;
    const hoy = Utils.hoyISO();

    // Lunes como primer día de la semana
    const primero = new Date(anio, mes, 1);
    const desplazamiento = (primero.getDay() + 6) % 7;
    const inicio = new Date(anio, mes, 1 - desplazamiento);
    const diasMes = new Date(anio, mes + 1, 0).getDate();
    const celdas = Math.ceil((desplazamiento + diasMes) / 7) * 7;

    let html = CalendarioView.DIAS.map((d) => `<div class="calendar__dow">${d}</div>`).join('');
    for (let i = 0; i < celdas; i++) {
      const f = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
      const iso = Utils.isoDe(f.getFullYear(), f.getMonth(), f.getDate());
      const otroMes = f.getMonth() !== mes;
      const delDia = eventos.filter((e) => e.fecha === iso);
      html += `
        <div class="calendar__day ${otroMes ? 'is-other' : ''} ${iso === hoy ? 'is-today' : ''}" data-fecha="${iso}">
          <span class="calendar__num">${f.getDate()}</span>
          ${delDia.map((e) => `
            <button type="button" class="cal-event cal-event--${e.estado}" data-id="${e.id}" title="${Utils.esc(`${e.tipo} · ${e.cliente.nombre} · ${Catalogo.ESTADOS[e.estado].label}`)}">
              <span>${Utils.esc(e.tipo)} · ${Utils.esc(e.cliente.nombre)}</span>
              <span>${Catalogo.ESTADOS[e.estado].label}</span>
            </button>`).join('')}
        </div>`;
    }
    document.getElementById('calendario').innerHTML = html;
  },

  bindNavegar(handler) {
    document.getElementById('mes-anterior').addEventListener('click', () => handler(-1));
    document.getElementById('mes-siguiente').addEventListener('click', () => handler(1));
  },

  /** Clic en un evento → handlerEvento(id); clic en un día vacío → handlerDia(fecha) */
  bindCalendario(handlerEvento, handlerDia) {
    document.getElementById('calendario').addEventListener('click', (e) => {
      const ev = e.target.closest('[data-id]');
      if (ev) { handlerEvento(ev.dataset.id); return; }
      const dia = e.target.closest('[data-fecha]');
      if (dia) handlerDia(dia.dataset.fecha);
    });
  },

  bindNuevo(handler) { document.getElementById('btn-crear').addEventListener('click', handler); },
};
