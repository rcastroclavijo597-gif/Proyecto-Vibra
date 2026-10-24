/* =========================================================
   VIBRA · core/seed.js
   Datos iniciales. Se cargan la primera vez que se abre la app.

   El proyecto empieza VACÍO: sin clientes ni eventos fijos.
   Solo existe la cuenta del administrador, necesaria para
   entrar al panel. Todo lo demás lo crean los usuarios.
   ========================================================= */

const Seed = {
  datos() {
    return {
      secuencia: 1001, // el primer evento creado será EV-1001

      usuarios: [
        { id: 'u1', nombre: 'Admin', apellidos: '', email: 'admin@gmail.com', telefono: '', password: 'admin123', rol: 'admin' },
      ],

      clientes: [],
      solicitudes: [],
    };
  },

  /**
   * Datos de ejemplo que traían las versiones anteriores del proyecto.
   * Store.migrar() los borra del navegador y conserva lo que creó el usuario.
   */
  ANTIGUOS: {
    usuarios: ['lucia@email.com'],
    clientes: ['lucia@email.com', 'carlos@email.com', 'marta@email.com', 'hola@studionorte.com', 'ana@email.com'],
    solicitudes: ['EV-1045', 'EV-1046', 'EV-1047', 'EV-1048'],
  },
};
