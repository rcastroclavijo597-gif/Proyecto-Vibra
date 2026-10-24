/* =========================================================
   CONTROLADOR · Panel del cliente
   Muestra su próximo evento, la propuesta y la conversación.
   Se actualiza solo cuando el admin cambia algo (otra pestaña).
   ========================================================= */

const PanelClienteController = {
  seleccionado: null,

  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'cliente', pagina: 'panel', titulo: 'Panel del cliente',
      cabecera: { tipo: 'cliente', variante: 'panel' },
    });
    if (!usuario) return;
    this.usuario = usuario;

    this.pintar();
    PanelClienteView.bindAcciones((accion, id) => this.accion(accion, id));
    PanelClienteView.bindVerFoto((id) => FotosView.abrirVisor((this.principal()?.fotos || []).find((f) => f.id === id)));
    PanelClienteView.bindConversacion(() => {
      const s = this.principal();
      if (!s) { ToastView.mostrar('Crea tu primer evento para hablar con un asesor.', 'error'); return; }
      ChatController.abrir(s.id, 'cliente');
    });

    // "Recibirás cada cambio aquí": refresca cuando el admin guarda en otra pestaña
    Store.alCambiar(() => this.pintar());
  },

  principal() {
    const lista = SolicitudModel.delCliente(this.usuario.email);
    return lista.find((s) => s.id === this.seleccionado) || SolicitudModel.proximaDe(this.usuario.email);
  },

  pintar() {
    const principal = this.principal();
    const otros = SolicitudModel.delCliente(this.usuario.email).filter((s) => s.id !== principal?.id);
    PanelClienteView.render(principal, otros);
  },

  accion(accion, id) {
    const s = SolicitudModel.porId(id);
    if (!s) return;
    if (accion === 'seleccionar') {
      this.seleccionado = id;
      this.pintar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (accion === 'editar') {
      BorradorModel.desdeSolicitud(s);
      Utils.ir('cliente/detalles.html');
    }
    if (accion === 'propuesta') {
      PanelClienteView.abrirPropuesta(s, () => {
        SolicitudModel.aceptarPropuesta(id);
        ToastView.mostrar('¡Propuesta aceptada! Tu evento está confirmado.');
        this.pintar();
      });
    }
  },
};
