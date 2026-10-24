/* =========================================================
   CONTROLADOR · App (controlador frontal)
   Arranque común de cada página: control de acceso,
   cabecera, iconos y navegador de vistas.
   ========================================================= */

const AppController = {
  /**
   * @param {{acceso:'publico'|'cliente'|'admin', cabecera?:object, pagina:string, titulo:string}} op
   * @returns {object|null} usuario conectado
   */
  iniciar({ acceso = 'publico', cabecera = null, pagina, titulo }) {
    Store.cargar(); // la primera vez crea la cuenta del administrador
    const usuario = SesionModel.actual();

    // ---- Control de acceso ----
    if (acceso === 'admin' && usuario?.rol !== 'admin') {
      Utils.ir(`login.html?next=${encodeURIComponent(AppController.rutaActual())}`);
      return null;
    }
    if (acceso === 'cliente') {
      if (!usuario) {
        Utils.ir(`login.html?next=${encodeURIComponent(AppController.rutaActual())}`);
        return null;
      }
      if (usuario.rol === 'admin') { Utils.ir('admin/resumen.html'); return null; }
    }

    // ---- Cabecera ----
    const slot = document.getElementById('app-header');
    if (slot && cabecera) {
      if (cabecera.tipo === 'admin') HeaderView.renderAdmin(slot, { activo: cabecera.activo, usuario });
      else HeaderView.renderCliente(slot, { variante: cabecera.variante, paso: cabecera.paso, usuario });
      HeaderView.bindLogout(slot, () => AppController.cerrarSesion());
    }

    Icons.pintar();

    // ---- Navegador de vistas (demo) ----
    const sw = SwitcherView.render({ paginaActual: pagina, titulo });
    SwitcherView.bindAcciones(sw, (accion) => AppController.accionDemo(accion));
    ToastView.mostrarFlash();

    return usuario;
  },

  /** Ruta de la página actual relativa a la raíz del proyecto. */
  rutaActual() {
    const partes = window.location.pathname.split('/');
    const archivo = partes.pop();
    const carpeta = partes.pop();
    const ruta = ['admin', 'cliente'].includes(carpeta) ? `${carpeta}/${archivo}` : archivo;
    return ruta + window.location.search;
  },

  cerrarSesion() {
    SesionModel.cerrar();
    Utils.ir('login.html');
  },

  async accionDemo(accion) {
    if (accion === 'reiniciar') {
      const ok = await ModalView.confirmar({
        titulo: 'Borrar todos los datos',
        mensaje: 'Se eliminarán todos los clientes, eventos y cuentas creadas. Solo quedará la cuenta del administrador. Esta acción no se puede deshacer.',
        aceptar: 'Borrar todo',
        peligro: true,
      });
      if (!ok) return;
      Store.reiniciar();
      Store.cargar();
      Utils.ir('index.html');
    }
  },
};

/* =========================================================
   CONTROLADOR · Modal de evento (crear / editar)
   Reutilizado por Resumen, Solicitudes, Calendario y Detalle.
   ========================================================= */
const EventoFormController = {
  /**
   * @param {{id?:string, fecha?:string, alGuardar?:Function}} op
   */
  abrir({ id = null, fecha = '', alGuardar } = {}) {
    const solicitud = id ? SolicitudModel.porId(id) : null;
    const modal = EventoFormView.abrir({ modo: solicitud ? 'editar' : 'crear', solicitud, fecha });

    // Fotos del lugar: se guardan en esta lista hasta pulsar "Crear evento" / "Guardar cambios"
    let fotos = (solicitud?.fotos || []).map((f) => ({ ...f }));
    FotosView.renderCampo(modal.fotos, fotos);
    FotosView.bindCampo(modal.fotos, {
      agregar: async (archivos) => {
        FotosView.ocupado(modal.fotos, true);
        const r = await FotoModel.preparar(archivos, fotos.length);
        fotos = [...fotos, ...r.fotos];
        FotosView.renderCampo(modal.fotos, fotos);
        if (r.errores.length) ToastView.mostrar(r.errores[0], 'error');
      },
      quitar: (id) => { fotos = FotoModel.quitar(fotos, id); FotosView.renderCampo(modal.fotos, fotos); },
      ver: (id) => FotosView.abrirVisor(fotos.find((f) => f.id === id)),
    });

    EventoFormView.bindGuardar(modal.form, (datos) => {
      datos.fotos = fotos;
      try {
        let resultado;
        if (solicitud) {
          resultado = SolicitudModel.actualizar(solicitud.id, datos, { validar: true });
          ToastView.mostrar(`Cambios guardados en ${solicitud.id}`);
        } else {
          resultado = SolicitudModel.crear(datos, 'manual');
          ToastView.mostrar(`Evento ${resultado.id} creado`);
        }
        modal.cerrar();
        alGuardar?.(resultado);
      } catch (err) {
        if (err.campos) FormView.mostrarErrores(modal.form, err.campos);
        else ToastView.mostrar(err.message, 'error');
      }
    });
  },

  /** Pide confirmación y elimina. */
  async eliminar(id, alEliminar) {
    const s = SolicitudModel.porId(id);
    const ok = await ModalView.confirmar({
      titulo: 'Eliminar solicitud',
      mensaje: `Vas a eliminar definitivamente <strong>${s.id}</strong> (${Utils.esc(s.tipo)} de ${Utils.esc(s.cliente.nombre)}). Esta acción no se puede deshacer.`,
      aceptar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    SolicitudModel.eliminar(id);
    ToastView.mostrar(`${id} eliminada`);
    alEliminar?.();
  },
};

/* =========================================================
   CONTROLADOR · Conversación
   ========================================================= */
const ChatController = {
  abrir(idSolicitud, yo) {
    const s = SolicitudModel.porId(idSolicitud);
    if (!s) return;
    const modal = ChatView.abrir({
      titulo: yo === 'admin' ? s.cliente.nombre : 'Habla con tu asesor',
      subtitulo: `${s.tipo} · ${Utils.fecha(s.fecha)}`,
    });
    const refrescar = () => ChatView.pintar(modal.el, SolicitudModel.porId(idSolicitud)?.mensajes || [], yo);
    refrescar();
    ChatView.bindEnviar(modal.el, (texto) => {
      SolicitudModel.agregarMensaje(idSolicitud, yo, texto);
      refrescar();
    });
    Store.alCambiar(() => { if (document.body.contains(modal.el)) refrescar(); });
  },
};
