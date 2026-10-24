/* =========================================================
   CONTROLADOR · Resumen (panel de control) y Solicitudes
   ========================================================= */

/** Acciones comunes de la tabla de solicitudes. */
const AccionesSolicitud = {
  ejecutar(accion, id, refrescar) {
    if (accion === 'alerta') TablaSolicitudesView.mostrarAlerta(SolicitudModel.porId(id)); // MODELO da los datos, VISTA los muestra
    if (accion === 'ver') Utils.ir(`admin/detalle.html?id=${id}`);
    if (accion === 'presupuesto') Utils.ir(`admin/presupuesto.html?id=${id}`);
    if (accion === 'editar') EventoFormController.abrir({ id, alGuardar: refrescar });
    if (accion === 'eliminar') EventoFormController.eliminar(id, refrescar);
  },
};

const ResumenController = {
  filtro: 'todas',

  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'resumen', titulo: 'Panel de control',
      cabecera: { tipo: 'admin', activo: 'resumen' },
    });
    if (!usuario) return;

    ResumenView.renderSaludo(usuario);
    this.pintar();
    ResumenView.bindFiltros((f) => { this.filtro = f; this.pintar(); });
    ResumenView.bindAcciones((accion, id) => AccionesSolicitud.ejecutar(accion, id, () => this.pintar()));
    ResumenView.bindCrear(() => EventoFormController.abrir({ alGuardar: () => this.pintar() }));
    Store.alCambiar(() => this.pintar());
  },

  pintar() {
    ResumenView.renderStats(SolicitudModel.estadisticas());
    const vacio = SolicitudModel.todas().length
      ? 'No hay solicitudes con este filtro.'
      : 'Todavía no hay solicitudes. Crea un evento manual o espera a que un cliente envíe una.';
    ResumenView.renderTabla(SolicitudModel.filtrar({ estado: this.filtro }), this.filtro, vacio);
  },
};

const SolicitudesController = {
  filtro: 'todas',
  texto: '',

  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'solicitudes', titulo: 'Solicitudes',
      cabecera: { tipo: 'admin', activo: 'solicitudes' },
    });
    if (!usuario) return;

    const estado = Utils.param('estado');
    if (estado && Catalogo.ESTADOS[estado]) this.filtro = estado;
    this.texto = Utils.param('q') || '';
    SolicitudesView.setBusqueda(this.texto);

    this.pintar();
    SolicitudesView.bindFiltros((f) => { this.filtro = f; this.pintar(); });
    SolicitudesView.bindBuscar((t) => { this.texto = t; this.pintar(); });
    SolicitudesView.bindAcciones((accion, id) => AccionesSolicitud.ejecutar(accion, id, () => this.pintar()));
    SolicitudesView.bindCrear(() => EventoFormController.abrir({ alGuardar: () => this.pintar() }));
    Store.alCambiar(() => this.pintar());
  },

  pintar() {
    SolicitudesView.render(SolicitudModel.filtrar({ estado: this.filtro, texto: this.texto }), this.filtro, SolicitudModel.todas().length);
  },
};
