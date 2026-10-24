/* =========================================================
   CONTROLADOR · Crear presupuesto
   ========================================================= */

const PresupuestoController = {
  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'presupuesto', titulo: 'Crear presupuesto',
      cabecera: { tipo: 'admin', activo: 'solicitudes' },
    });
    if (!usuario) return;

    this.id = Utils.param('id');
    const s = SolicitudModel.porId(this.id);
    if (!s) { Utils.ir('admin/solicitudes.html'); return; }

    const propuesta = s.propuesta || SolicitudModel.propuestaInicial(s);
    PresupuestoView.render(s, propuesta);
    this.recalcular();

    PresupuestoView.bind({
      cambio: () => this.recalcular(),
      anadir: () => {
        const p = PresupuestoView.leer();
        p.conceptos.push({ nombre: '', detalle: '', precio: 0 });
        PresupuestoView.renderConceptos(p.conceptos);
        PresupuestoView.enfocarUltimo();
        this.recalcular();
      },
      quitar: (i) => {
        const p = PresupuestoView.leer();
        p.conceptos.splice(i, 1);
        PresupuestoView.renderConceptos(p.conceptos);
        this.recalcular();
      },
      borrador: () => {
        SolicitudModel.guardarPropuesta(this.id, PresupuestoView.leer(), false);
        ToastView.mostrar('Borrador guardado');
      },
      enviar: () => this.enviar(),
    });
  },

  recalcular() {
    PresupuestoView.renderTotales(SolicitudModel.totalesPropuesta(PresupuestoView.leer()));
  },

  async enviar() {
    const p = PresupuestoView.leer();
    const { total } = SolicitudModel.totalesPropuesta(p);
    const s = SolicitudModel.porId(this.id);
    const ok = await ModalView.confirmar({
      titulo: 'Enviar propuesta',
      mensaje: `Se enviará una propuesta de <strong>${Utils.euros(total, { agrupar: true, decimales: true })}</strong> a ${Utils.esc(s.cliente.nombre)}. La solicitud pasará a <strong>Propuesta enviada</strong> y el cliente podrá aceptarla desde su panel.`,
      aceptar: 'Enviar al cliente',
    });
    if (!ok) return;
    try {
      SolicitudModel.guardarPropuesta(this.id, p, true);
      ToastView.flash('Propuesta enviada al cliente');
      Utils.ir(`admin/detalle.html?id=${this.id}`);
    } catch (err) {
      ToastView.mostrar(err.message, 'error');
    }
  },
};
