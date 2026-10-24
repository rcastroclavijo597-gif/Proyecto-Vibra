/* =========================================================
   MODELO · Usuario
   Registro y autenticación de cuentas (clientes y admin).
   ========================================================= */

const UsuarioModel = {
  todos() { return Store.tabla('usuarios'); },

  porId(id) { return UsuarioModel.todos().find((u) => u.id === id) || null; },

  porEmail(email) {
    const e = (email || '').trim().toLowerCase();
    return UsuarioModel.todos().find((u) => u.email.toLowerCase() === e) || null;
  },

  /** Valida los datos de registro. Devuelve un objeto {campo: mensaje}. */
  validarRegistro(d) {
    const err = {};
    if (!d.nombre?.trim()) err.nombre = 'Escribe tu nombre.';
    if (!d.apellidos?.trim()) err.apellidos = 'Escribe tus apellidos.';
    if (!Utils.emailValido(d.email || '')) err.email = 'Introduce un correo válido.';
    else if (UsuarioModel.porEmail(d.email)) err.email = 'Ya existe una cuenta con este correo.';
    if (!/^[+\d][\d\s-]{6,}$/.test((d.telefono || '').trim())) err.telefono = 'Introduce un teléfono válido.';
    if ((d.password || '').length < 8) err.password = 'Mínimo 8 caracteres.';
    if (!d.terminos) err.terminos = 'Debes aceptar los términos de uso.';
    return err;
  },

  /** Crea una cuenta de cliente y su ficha en la base de clientes. */
  registrar(d) {
    const errores = UsuarioModel.validarRegistro(d);
    if (Object.keys(errores).length) {
      const e = new Error('Datos no válidos');
      e.campos = errores;
      throw e;
    }
    const usuario = {
      id: 'u' + Date.now(),
      nombre: d.nombre.trim(),
      apellidos: d.apellidos.trim(),
      email: d.email.trim().toLowerCase(),
      telefono: d.telefono.trim(),
      password: d.password,
      rol: 'cliente',
    };
    Store.transaccion((db) => { db.usuarios.push(usuario); });
    ClienteModel.asegurar({ nombre: `${usuario.nombre} ${usuario.apellidos}`, email: usuario.email, telefono: usuario.telefono });
    return usuario;
  },

  autenticar(email, password) {
    const u = UsuarioModel.porEmail(email);
    if (!u || u.password !== password) throw new Error('Correo o contraseña incorrectos.');
    return u;
  },

  nombreCompleto(u) { return [u.nombre, u.apellidos].filter(Boolean).join(' '); },
};
