/* =========================================================
   MODELO · Sesión
   Guarda qué usuario está conectado.
   Se usa sessionStorage: la sesión dura mientras la pestaña
   esté abierta. Al cerrar la pestaña o el navegador, hay que
   volver a iniciar sesión.
   ========================================================= */

const SesionModel = {
  KEY: 'vibra_sesion',

  iniciar(usuario) {
    sessionStorage.setItem(SesionModel.KEY, JSON.stringify({ userId: usuario.id, desde: new Date().toISOString() }));
  },

  /** Usuario conectado o null. */
  actual() {
    try {
      const s = JSON.parse(sessionStorage.getItem(SesionModel.KEY));
      return s ? UsuarioModel.porId(s.userId) : null;
    } catch {
      return null;
    }
  },

  esAdmin() { return SesionModel.actual()?.rol === 'admin'; },

  cerrar() {
    sessionStorage.removeItem(SesionModel.KEY);
    localStorage.removeItem(SesionModel.KEY); // limpia sesiones de versiones anteriores
  },
};
