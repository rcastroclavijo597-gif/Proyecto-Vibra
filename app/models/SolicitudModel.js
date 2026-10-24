/* =========================================================
   MODELO · Solicitud (evento)
   Toda la lógica de negocio de las solicitudes de eventos:
   creación, estados, cobros, propuestas, mensajes y métricas.
   ========================================================= */

const SolicitudModel = {
  /* ---------- Lectura ---------- */
  todas() {
    return Store.tabla('solicitudes').sort((a, b) => SolicitudModel.numero(b.id) - SolicitudModel.numero(a.id));
  },
  numero(id) { return parseInt(String(id).replace(/\D/g, ''), 10) || 0; },
  porId(id) { return SolicitudModel.todas().find((s) => s.id === id) || null; },
  delCliente(email) {
    const e = (email || '').toLowerCase();
    return SolicitudModel.todas().filter((s) => s.cliente.email.toLowerCase() === e);
  },

  /** Filtra por estado ('todas' | clave de estado) y texto libre. */
  filtrar({ estado = 'todas', texto = '' } = {}) {
    const q = Utils.normalizar(texto.trim());
    return SolicitudModel.todas().filter((s) => {
      const okEstado = estado === 'todas' || s.estado === estado;
      const okTexto = !q || Utils.normalizar(`${s.id} ${s.cliente.nombre} ${s.cliente.email} ${s.tipo}`).includes(q);
      return okEstado && okTexto;
    });
  },

  porCobro(cobro) { return SolicitudModel.todas().filter((s) => s.cobro === cobro); },

  /** Solicitudes cuyo evento cae en un mes concreto (calendario). */
  delMes(anio, mes) {
    return SolicitudModel.todas().filter((s) => {
      const p = Utils.partesFecha(s.fecha);
      return p && p.a === anio && p.m === mes;
    });
  },

  /** Próximo evento del cliente (o el más reciente si ya pasaron todos). */
  proximaDe(email) {
    const lista = SolicitudModel.delCliente(email);
    if (!lista.length) return null;
    const hoy = Utils.hoyISO();
    const futuras = lista.filter((s) => s.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha));
    return futuras[0] || lista[0];
  },

  /* ---------- Cálculos ---------- */
  totalesPropuesta(propuesta) {
    const subtotal = (propuesta?.conceptos || []).reduce((t, c) => t + (Number(c.precio) || 0), 0);
    const iva = Math.round(subtotal * Catalogo.IVA * 100) / 100;
    return { subtotal, iva, total: Math.round((subtotal + iva) * 100) / 100 };
  },

  /** Valor del evento: la propuesta en preparación o, si ya se acordó, el precio. */
  importeEstimado(s) {
    if (s.propuesta && s.propuesta.estado === 'borrador') return SolicitudModel.totalesPropuesta(s.propuesta).total;
    return Number(s.precio) || 0;
  },

  estadisticas() {
    const todas = SolicitudModel.todas();
    const pendientes = todas.filter((s) => s.cobro === 'pendiente');
    const pagadas = todas.filter((s) => s.cobro === 'pagado');
    const suma = (l) => l.reduce((t, s) => t + (Number(s.precio) || 0), 0);
    return {
      nuevas: todas.filter((s) => s.estado === 'nueva').length,
      activas: todas.length,
      pendienteCobro: suma(pendientes),
      eventosPendientes: pendientes.length,
      facturado: suma(pagadas),
      eventosPagados: pagadas.length,
    };
  },

  /* ---------- Validación ---------- */
  validar(d) {
    const err = {};
    if (!d.cliente?.nombre?.trim()) err.nombre = 'Obligatorio.';
    if (!Utils.emailValido(d.cliente?.email || '')) err.email = 'Correo no válido.';
    if (!d.cliente?.telefono?.trim()) err.telefono = 'Obligatorio.';
    if (!d.tipo) err.tipo = 'Obligatorio.';
    if (!d.fecha) err.fecha = 'Obligatorio.';
    if (!d.invitados) err.invitados = 'Obligatorio.';
    if (!d.ciudad?.trim()) err.ciudad = 'Obligatorio.';
    if (!d.espacio) err.espacio = 'Obligatorio.';
    if (!(Number(d.precio) > 0)) err.precio = 'Indica un importe.';
    if (!d.servicios?.length) err.servicios = 'Selecciona al menos un servicio.';
    return err;
  },

  lanzarSiHayErrores(errores) {
    if (Object.keys(errores).length) {
      const e = new Error('Revisa los campos marcados.');
      e.campos = errores;
      throw e;
    }
  },

  /* ---------- Escritura ---------- */
  /**
   * Crea una solicitud.
   * @param {object} d datos del evento
   * @param {'web'|'manual'} origen
   */
  crear(d, origen = 'web') {
    if (origen === 'manual') SolicitudModel.lanzarSiHayErrores(SolicitudModel.validar(d));
    const ahora = new Date().toISOString();
    const solicitud = Store.transaccion((db) => {
      const id = `EV-${db.secuencia++}`;
      const nueva = {
        id, origen,
        cliente: { nombre: d.cliente.nombre.trim(), email: d.cliente.email.trim().toLowerCase(), telefono: (d.cliente.telefono || '').trim() },
        tipo: d.tipo, fecha: d.fecha, invitados: d.invitados, espacio: d.espacio, ciudad: (d.ciudad || '').trim(),
        notas: (d.notas || '').trim(),
        servicios: d.servicios || [],
        fotos: d.fotos || [], // fotos del lugar (ver FotoModel)
        precio: Number(d.precio) || 0,
        estado: d.estado || 'nueva',
        cobro: d.cobro || 'pendiente',
        propuesta: null,
        actividad: [{
          titulo: 'Solicitud recibida',
          descripcion: origen === 'manual' ? 'El administrador creó este evento manualmente.' : 'El cliente envió la solicitud desde la web.',
          fecha: ahora, inicial: true,
        }],
        mensajes: [],
        creada: ahora,
      };
      db.solicitudes.push(nueva);
      return nueva;
    });
    ClienteModel.asegurar({ nombre: solicitud.cliente.nombre, email: solicitud.cliente.email, telefono: solicitud.cliente.telefono, ciudad: solicitud.ciudad });
    return solicitud;
  },

  /** Actualiza campos y deja registro en la actividad de los cambios importantes. */
  actualizar(id, cambios, { validar = false } = {}) {
    return Store.transaccion((db) => {
      const s = db.solicitudes.find((x) => x.id === id);
      if (!s) throw new Error('La solicitud no existe.');
      const merged = { ...s, ...cambios, cliente: { ...s.cliente, ...(cambios.cliente || {}) } };
      if (validar) SolicitudModel.lanzarSiHayErrores(SolicitudModel.validar(merged));

      const ahora = new Date().toISOString();
      const log = (titulo, descripcion) => s.actividad.push({ titulo, descripcion, fecha: ahora });

      if (cambios.estado && cambios.estado !== s.estado) {
        log(`Estado actualizado: ${Catalogo.ESTADOS[cambios.estado].label}`, 'El cliente puede ver este cambio desde su panel.');
      }
      if (cambios.cobro && cambios.cobro !== s.cobro) {
        log(`Cobro marcado como ${Catalogo.COBROS[cambios.cobro].toLowerCase()}`, 'Se actualizó el estado del cobro.');
      }
      if (cambios.precio !== undefined && Number(cambios.precio) !== Number(s.precio)) {
        log('Precio acordado actualizado', `Nuevo importe: ${Utils.euros(cambios.precio)}.`);
      }
      if (cambios.fotos !== undefined && JSON.stringify(cambios.fotos) !== JSON.stringify(s.fotos || [])) {
        const n = cambios.fotos.length;
        log('Fotos del lugar actualizadas', n ? `Ahora hay ${Utils.plural(n, 'foto', 'fotos')} del lugar.` : 'Se quitaron las fotos del lugar.');
      }
      const otrosCampos = ['tipo', 'fecha', 'invitados', 'espacio', 'ciudad', 'notas', 'servicios'];
      if (otrosCampos.some((k) => cambios[k] !== undefined && JSON.stringify(cambios[k]) !== JSON.stringify(s[k]))) {
        log('Datos del evento editados', 'Se modificó la información del evento.');
      }

      Object.assign(s, merged);
      if (cambios.precio !== undefined) s.precio = Number(cambios.precio) || 0;
      return s;
    });
  },

  eliminar(id) {
    Store.transaccion((db) => { db.solicitudes = db.solicitudes.filter((s) => s.id !== id); });
  },

  /** Propuesta inicial a partir de los servicios pedidos. */
  propuestaInicial(s) {
    const base = { sonido: 650, dj: 720, iluminacion: 480, efectos: 300, musica: 900, medida: 400 };
    const conceptos = s.servicios.map((x) => {
      const def = Catalogo.servicio(x.id);
      const detalle = Catalogo.detalleServicio(x);
      const porEquipos = Catalogo.precioReferencia(x); // Σ cantidad × precio unitario
      return { nombre: def.nombre, detalle: detalle === 'Sin configuración adicional' ? '' : detalle, precio: porEquipos || base[x.id] || 0 };
    });
    conceptos.push({ nombre: 'Transporte y montaje', detalle: `${s.ciudad || 'Ciudad'} y alrededores`, precio: 200 });
    const nombre = s.cliente.nombre.split(' ')[0];
    return {
      estado: 'borrador',
      conceptos,
      mensaje: `Hola ${nombre}, hemos preparado esta propuesta según los detalles de tu ${s.tipo.toLowerCase()}. Todos los servicios incluyen montaje, pruebas y asistencia técnica.`,
    };
  },

  /** Guarda la propuesta; si enviar=true pasa la solicitud a "Propuesta enviada". */
  guardarPropuesta(id, propuesta, enviar = false) {
    const conceptos = propuesta.conceptos
      .map((c) => ({ nombre: c.nombre.trim(), detalle: (c.detalle || '').trim(), precio: Number(c.precio) || 0 }))
      .filter((c) => c.nombre);
    if (enviar && !conceptos.length) throw new Error('Añade al menos un concepto.');
    if (enviar && conceptos.some((c) => c.precio <= 0)) throw new Error('Todos los conceptos necesitan un precio.');

    const datos = { estado: enviar ? 'enviada' : 'borrador', conceptos, mensaje: propuesta.mensaje.trim() };
    const { total } = SolicitudModel.totalesPropuesta(datos);

    return Store.transaccion((db) => {
      const s = db.solicitudes.find((x) => x.id === id);
      s.propuesta = datos;
      if (enviar) {
        s.precio = total;
        s.estado = 'propuesta';
        s.actividad.push({ titulo: 'Propuesta enviada', descripcion: `Se envió una propuesta de ${Utils.euros(total, { decimales: true, agrupar: true })} al cliente.`, fecha: new Date().toISOString() });
      }
      return s;
    });
  },

  /** El cliente acepta la propuesta desde su panel. */
  aceptarPropuesta(id) {
    return Store.transaccion((db) => {
      const s = db.solicitudes.find((x) => x.id === id);
      s.estado = 'confirmada';
      s.propuesta.estado = 'aceptada';
      s.actividad.push({ titulo: 'Propuesta aceptada', descripcion: 'El cliente aceptó la propuesta desde su panel.', fecha: new Date().toISOString() });
      return s;
    });
  },

  agregarMensaje(id, autor, texto) {
    const limpio = (texto || '').trim();
    if (!limpio) return null;
    return Store.transaccion((db) => {
      const s = db.solicitudes.find((x) => x.id === id);
      s.mensajes = s.mensajes || [];
      s.mensajes.push({ autor, texto: limpio, fecha: new Date().toISOString() });
      return s;
    });
  },
};
