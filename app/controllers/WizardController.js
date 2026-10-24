/* =========================================================
   CONTROLADOR · Asistente de solicitud del cliente
   Paso 1 (servicios) → Paso 2 (detalles) → Paso 3 (revisar)
   ========================================================= */

const WizardController = {
  /* ---------- Paso 1 ---------- */
  servicios() {
    const usuario = AppController.iniciar({
      acceso: 'cliente', pagina: 'servicios', titulo: 'Paso 1 · Servicios',
      cabecera: { tipo: 'cliente', variante: 'saludo' },
    });
    if (!usuario) return;
    if (Utils.param('nuevo') === '1') BorradorModel.limpiar();

    const pintar = () => WizardView.renderServicios(BorradorModel.obtener().servicios);
    pintar();
    WizardView.bindServicio((id) => { BorradorModel.alternarServicio(id); pintar(); });
    WizardView.bindContinuar(() => {
      if (!BorradorModel.obtener().servicios.length) {
        ToastView.mostrar('Selecciona al menos un servicio para continuar.', 'error');
        return;
      }
      Utils.ir('cliente/detalles.html');
    });
  },

  /* ---------- Paso 2 ---------- */
  detalles() {
    const usuario = AppController.iniciar({
      acceso: 'cliente', pagina: 'detalles', titulo: 'Paso 2 · Detalles',
      cabecera: { tipo: 'cliente', variante: 'pasos', paso: 2 },
    });
    if (!usuario) return;

    const borrador = BorradorModel.obtener();
    if (!borrador.servicios.length) { Utils.ir('cliente/servicios.html'); return; }

    WizardView.renderDetalles(borrador);
    const guardar = () => BorradorModel.guardar(WizardView.leerDetalles());

    WizardView.bindTipo((tipo) => { WizardView.marcarTipo(tipo); guardar(); });
    WizardView.bindFotos({
      agregar: (archivos) => WizardController.agregarFotos(archivos),
      quitar: (id) => WizardView.renderFotos(BorradorModel.quitarFoto(id).fotos),
      ver: (id) => FotosView.abrirVisor(BorradorModel.obtener().fotos.find((f) => f.id === id)),
    });
    WizardView.bindCambios(guardar); // autoguardado del borrador
    WizardView.bindRevisar(() => {
      const b = guardar();
      const errores = BorradorModel.validarDetalles(b);
      if (Object.keys(errores).length) { WizardView.mostrarErrores(errores); return; }
      Utils.ir('cliente/revisar.html');
    });
  },

  /** Valida y comprime las fotos (FotoModel) y las guarda en el borrador. */
  async agregarFotos(archivos) {
    WizardView.fotosOcupado(true);
    const { fotos, errores } = await FotoModel.preparar(archivos, BorradorModel.obtener().fotos.length);
    try {
      if (fotos.length) BorradorModel.agregarFotos(fotos);
    } catch (err) {
      errores.push(err.message); // por ejemplo, sin espacio en el navegador
    }
    WizardView.renderFotos(BorradorModel.obtener().fotos);
    if (errores.length) ToastView.mostrar(errores[0], 'error');
    else if (fotos.length) ToastView.mostrar(fotos.length === 1 ? 'Foto añadida' : `${fotos.length} fotos añadidas`);
  },

  /* ---------- Paso 3 ---------- */
  revisar() {
    const usuario = AppController.iniciar({
      acceso: 'cliente', pagina: 'revisar', titulo: 'Paso 3 · Revisar',
      cabecera: { tipo: 'cliente', variante: 'pasos', paso: 3 },
    });
    if (!usuario) return;

    const b = BorradorModel.obtener();
    if (!b.servicios.length) { Utils.ir('cliente/servicios.html'); return; }
    if (Object.keys(BorradorModel.validarDetalles(b)).length) { Utils.ir('cliente/detalles.html'); return; }

    WizardView.renderResumen(b, usuario);
    WizardView.bindVerFoto((id) => FotosView.abrirVisor(b.fotos.find((f) => f.id === id)));
    WizardView.bindEnviar(() => {
      const datos = {
        cliente: { nombre: UsuarioModel.nombreCompleto(usuario), email: usuario.email, telefono: usuario.telefono },
        tipo: b.tipo, fecha: b.fecha, invitados: b.invitados, ciudad: b.ciudad, espacio: b.espacio, notas: b.notas,
        servicios: b.servicios,
        fotos: b.fotos,
      };
      try {
        WizardController.enviar(b, datos);
      } catch (err) {
        ToastView.mostrar(err.message, 'error');
      }
    });
  },

  /** Crea la solicitud (o guarda los cambios si se estaba editando). */
  enviar(b, datos) {
    if (b.editandoId) {
      SolicitudModel.actualizar(b.editandoId, datos);
      ToastView.flash('Hemos actualizado los datos de tu evento');
    } else {
      const s = SolicitudModel.crear(datos, 'web');
      ToastView.flash(`¡Solicitud ${s.id} enviada! Te avisaremos aquí de cada cambio.`);
    }
    BorradorModel.limpiar();
    Utils.ir('cliente/panel.html');
  },
};
