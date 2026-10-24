/* =========================================================
   MODELO · Borrador de solicitud
   Guarda lo que el cliente va completando en los pasos 1–3.
   ========================================================= */

const BorradorModel = {
  KEY: 'vibra_borrador',

  vacio() {
    return { editandoId: null, servicios: [], tipo: '', fecha: '', invitados: '', ciudad: '', espacio: '', notas: '', fotos: [] };
  },

  obtener() {
    try {
      return { ...BorradorModel.vacio(), ...(JSON.parse(localStorage.getItem(BorradorModel.KEY)) || {}) };
    } catch {
      return BorradorModel.vacio();
    }
  },

  guardar(cambios) {
    const actual = BorradorModel.obtener();
    const nuevo = { ...actual, ...cambios };
    Store.escribir(() => localStorage.setItem(BorradorModel.KEY, JSON.stringify(nuevo)));
    return nuevo;
  },

  /** Selecciona/deselecciona un servicio conservando su configuración. */
  alternarServicio(id) {
    const b = BorradorModel.obtener();
    const existe = b.servicios.some((s) => s.id === id);
    const servicios = existe ? b.servicios.filter((s) => s.id !== id) : [...b.servicios, { id, config: null }];
    // Mantiene el orden del catálogo
    servicios.sort((a, c) => Catalogo.SERVICIOS.findIndex((s) => s.id === a.id) - Catalogo.SERVICIOS.findIndex((s) => s.id === c.id));
    return BorradorModel.guardar({ servicios });
  },

  /** Carga una solicitud existente para editarla desde el panel. */
  desdeSolicitud(s) {
    return BorradorModel.guardar({
      editandoId: s.id,
      servicios: s.servicios.map((x) => ({ ...x })),
      tipo: s.tipo, fecha: s.fecha, invitados: s.invitados, ciudad: s.ciudad, espacio: s.espacio, notas: s.notas,
      fotos: (s.fotos || []).map((f) => ({ ...f })),
    });
  },

  validarDetalles(b) {
    const err = {};
    if (!b.tipo) err.tipo = 'Elige qué estás celebrando.';
    if (!b.fecha) err.fecha = 'Indica la fecha.';
    else if (!b.editandoId && b.fecha < Utils.hoyISO()) err.fecha = 'La fecha no puede ser pasada.';
    if (!b.invitados) err.invitados = 'Selecciona una opción.';
    if (!b.ciudad?.trim()) err.ciudad = 'Indica la ciudad.';
    if (!b.espacio) err.espacio = 'Selecciona una opción.';
    // Sonido, iluminación y efectos necesitan al menos un equipo con cantidad
    b.servicios.forEach((s) => {
      const def = Catalogo.servicio(s.id);
      if (def?.config?.tipo === 'cantidades' && !(Array.isArray(s.config) && s.config.some((x) => x.cantidad > 0))) {
        err[`cfg-${s.id}`] = `Elige al menos un equipo de ${def.nombre.toLowerCase()} y su cantidad.`;
      }
    });
    return err;
  },

  /** Añade fotos ya preparadas por FotoModel. */
  agregarFotos(nuevas) {
    const b = BorradorModel.obtener();
    return BorradorModel.guardar({ fotos: [...(b.fotos || []), ...nuevas].slice(0, FotoModel.MAX_FOTOS) });
  },

  quitarFoto(id) {
    return BorradorModel.guardar({ fotos: FotoModel.quitar(BorradorModel.obtener().fotos, id) });
  },

  limpiar() { localStorage.removeItem(BorradorModel.KEY); },
};
