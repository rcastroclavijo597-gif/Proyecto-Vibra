/* =========================================================
   CONTROLADOR · Calendario operativo
   ========================================================= */

const CalendarioController = {
  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'calendario', titulo: 'Calendario operativo',
      cabecera: { tipo: 'admin', activo: 'calendario' },
    });
    if (!usuario) return;

    const inicial = this.mesInicial();
    this.anio = inicial.anio;
    this.mes = inicial.mes;
    this.pintar();

    CalendarioView.bindNavegar((paso) => {
      const f = new Date(this.anio, this.mes + paso, 1);
      this.anio = f.getFullYear();
      this.mes = f.getMonth();
      this.pintar();
    });
    CalendarioView.bindCalendario(
      (id) => Utils.ir(`admin/detalle.html?id=${id}`),
      (fecha) => EventoFormController.abrir({ fecha, alGuardar: () => this.pintar() }),
    );
    CalendarioView.bindNuevo(() => EventoFormController.abrir({ alGuardar: () => this.pintar() }));
    Store.alCambiar(() => this.pintar());
  },

  /**
   * Mes con el que abre el calendario: ?mes=AAAA-MM, el mes actual si tiene
   * eventos o, si no, el mes con más eventos programados.
   */
  mesInicial() {
    const p = Utils.param('mes');
    if (/^\d{4}-\d{2}$/.test(p || '')) return { anio: +p.slice(0, 4), mes: +p.slice(5, 7) - 1 };
    const hoy = new Date();
    if (SolicitudModel.delMes(hoy.getFullYear(), hoy.getMonth()).length) return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
    const conteo = {};
    SolicitudModel.todas().forEach((s) => { const k = s.fecha.slice(0, 7); conteo[k] = (conteo[k] || 0) + 1; });
    const mejor = Object.entries(conteo).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    return mejor ? { anio: +mejor[0].slice(0, 4), mes: +mejor[0].slice(5, 7) - 1 } : { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  },

  pintar() {
    // Incluye los meses vecinos para los días de relleno de la cuadrícula
    const eventos = [-1, 0, 1].flatMap((d) => {
      const f = new Date(this.anio, this.mes + d, 1);
      return SolicitudModel.delMes(f.getFullYear(), f.getMonth());
    });
    CalendarioView.render(this.anio, this.mes, eventos);
  },
};
