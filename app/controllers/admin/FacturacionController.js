/* =========================================================
   CONTROLADOR · Facturación y Clientes
   ========================================================= */

const FacturacionController = {
  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'facturacion', titulo: 'Facturación',
      cabecera: { tipo: 'admin', activo: 'facturacion' },
    });
    if (!usuario) return;

    this.vista = Utils.param('vista') === 'pagados' ? 'pagados' : 'pendientes';
    this.pintar();
    FacturacionView.bindVista((v) => {
      this.vista = v;
      history.replaceState(null, '', `?vista=${v}`);
      this.pintar();
    });
    FacturacionView.bindFila((id) => Utils.ir(`admin/detalle.html?id=${id}`));
    Store.alCambiar(() => this.pintar());
  },

  pintar() {
    const lista = SolicitudModel.porCobro(this.vista === 'pagados' ? 'pagado' : 'pendiente');
    FacturacionView.render(this.vista, lista);
  },
};

const ClientesController = {
  texto: '',

  iniciar() {
    const usuario = AppController.iniciar({
      acceso: 'admin', pagina: 'clientes', titulo: 'Clientes',
      cabecera: { tipo: 'admin', activo: 'clientes' },
    });
    if (!usuario) return;

    this.pintar();
    ClientesView.bindBuscar((t) => { this.texto = t; this.pintar(); });
    ClientesView.bindFila((email) => Utils.ir(`admin/solicitudes.html?q=${encodeURIComponent(email)}`));
    ClientesView.bindAnadir(() => this.alta());
    Store.alCambiar(() => this.pintar());
  },

  pintar() { ClientesView.render(ClienteModel.buscar(this.texto), ClienteModel.todos().length > 0); },

  alta() {
    const modal = ClientesView.abrirAlta();
    const form = modal.el.querySelector('#form-cliente');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      try {
        const c = ClienteModel.crear(FormView.leer(form));
        modal.cerrar();
        ToastView.mostrar(`${c.nombre} añadido a clientes`);
        this.pintar();
      } catch (err) {
        if (err.campos) FormView.mostrarErrores(form, err.campos);
        else ToastView.mostrar(err.message, 'error');
      }
    });
  },
};
