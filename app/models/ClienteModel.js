/* =========================================================
   MODELO · Cliente
   Base de datos de clientes con su actividad y facturación.
   ========================================================= */

const ClienteModel = {
  /** Lista de clientes con estadísticas calculadas. */
  todos() {
    const solicitudes = SolicitudModel.todas();
    return Store.tabla('clientes').map((c) => {
      const propias = solicitudes.filter((s) => s.cliente.email.toLowerCase() === c.email.toLowerCase());
      return {
        ...c,
        solicitudes: propias,
        eventos: (c.eventosPrevios || 0) + propias.length,
        facturacion: (c.facturacionPrevia || 0) + propias.reduce((t, s) => t + SolicitudModel.importeEstimado(s), 0),
      };
    });
  },

  porEmail(email) {
    const e = (email || '').toLowerCase();
    return ClienteModel.todos().find((c) => c.email.toLowerCase() === e) || null;
  },

  buscar(texto) {
    const q = Utils.normalizar(texto.trim());
    const lista = ClienteModel.todos();
    if (!q) return lista;
    return lista.filter((c) => Utils.normalizar(`${c.nombre} ${c.email}`).includes(q));
  },

  validar(d) {
    const err = {};
    if (!d.nombre?.trim()) err.nombre = 'El nombre es obligatorio.';
    if (!Utils.emailValido(d.email || '')) err.email = 'Correo no válido.';
    else if (ClienteModel.porEmail(d.email)) err.email = 'Ya existe un cliente con este correo.';
    return err;
  },

  crear(d) {
    const errores = ClienteModel.validar(d);
    if (Object.keys(errores).length) {
      const e = new Error('Datos no válidos');
      e.campos = errores;
      throw e;
    }
    const cliente = {
      id: 'c' + Date.now(),
      nombre: d.nombre.trim(),
      email: d.email.trim().toLowerCase(),
      telefono: (d.telefono || '').trim(),
      ciudad: (d.ciudad || '').trim(),
      eventosPrevios: 0,
      facturacionPrevia: 0,
    };
    Store.transaccion((db) => { db.clientes.push(cliente); });
    return cliente;
  },

  /** Crea el cliente si no existe (se usa al registrar o crear eventos). */
  asegurar({ nombre, email, telefono = '', ciudad = '' }) {
    if (!email) return null;
    const existente = Store.tabla('clientes').find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (existente) return existente;
    return ClienteModel.crear({ nombre, email, telefono, ciudad });
  },
};
