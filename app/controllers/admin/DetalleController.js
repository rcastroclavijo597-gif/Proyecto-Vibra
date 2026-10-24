/* =========================================================
   CONTROLADOR · Detalle de solicitud
   ========================================================= */

const DetalleController = {
  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'detalle', titulo: 'Detalle de solicitud',
      cabecera: { tipo: 'admin', activo: 'solicitudes' },
    });
    if (!usuario) return;

    this.id = Utils.param('id');
    if (!SolicitudModel.porId(this.id)) { DetalleView.renderNoEncontrada(); return; }

    this.pintar();
    DetalleView.bindEditar(() => EventoFormController.abrir({ id: this.id, alGuardar: () => this.pintar() }));
    DetalleView.bindPresupuesto(() => Utils.ir(`admin/presupuesto.html?id=${this.id}`));
    DetalleView.bindInternos({
      guardar: () => this.guardarGestion(),
      eliminar: () => EventoFormController.eliminar(this.id, () => {
        ToastView.flash(`${this.id} eliminada`);
        Utils.ir('admin/solicitudes.html');
      }),
      mensaje: () => ChatController.abrir(this.id, 'admin'),
      verFoto: (id) => FotosView.abrirVisor((SolicitudModel.porId(this.id).fotos || []).find((f) => f.id === id)),
    });
    Store.alCambiar(() => { if (SolicitudModel.porId(this.id)) this.pintar(); });
  },

  pintar() { DetalleView.render(SolicitudModel.porId(this.id)); },

  guardarGestion() {
    const cambios = DetalleView.leerGestion();
    if (cambios.precio < 0) { ToastView.mostrar('El precio no puede ser negativo.', 'error'); return; }
    SolicitudModel.actualizar(this.id, cambios);
    ToastView.mostrar('Gestión guardada. El cliente ya lo ve en su panel.');
    this.pintar();
  },
};
