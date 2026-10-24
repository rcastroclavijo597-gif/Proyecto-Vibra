/* =========================================================
   CONTROLADOR · Autenticación
   Registro de clientes e inicio de sesión (cliente / admin).
   ========================================================= */

const AuthController = {
  registro() {
    const usuario = AppController.iniciar({ acceso: 'publico', pagina: 'registro', titulo: 'Crear cuenta' });
    if (usuario) {
      // Ya hay sesión: se envía a su área
      Utils.ir(usuario.rol === 'admin' ? 'admin/resumen.html' : 'cliente/panel.html');
      return;
    }
    AuthView.bindVerPassword();
    AuthView.cargarFoto();
    AuthView.bindEnviar((datos) => {
      try {
        const nuevo = UsuarioModel.registrar(datos);
        // No se inicia sesión: el usuario debe entrar con su nueva cuenta
        BorradorModel.limpiar();
        ToastView.flash('¡Cuenta creada! Ahora inicia sesión para continuar.');
        const next = Utils.param('next');
        Utils.ir(`login.html?email=${encodeURIComponent(nuevo.email)}${next ? `&next=${encodeURIComponent(next)}` : ''}`);
      } catch (err) {
        if (err.campos) AuthView.mostrarErrores(err.campos);
        else AuthView.mostrarAlerta(err.message);
      }
    });
  },

  login() {
    const usuario = AppController.iniciar({ acceso: 'publico', pagina: 'login', titulo: 'Iniciar sesión' });
    if (usuario) {
      Utils.ir(usuario.rol === 'admin' ? 'admin/resumen.html' : 'cliente/panel.html');
      return;
    }
    AuthView.bindVerPassword();
    AuthView.cargarFoto();
    AuthView.precargarEmail(Utils.param('email'));
    AuthView.bindEnviar(({ email, password }) => {
      try {
        const u = UsuarioModel.autenticar(email, password);
        SesionModel.iniciar(u);
        const siguiente = Utils.param('next');
        const permitido = siguiente && !/^[a-z]+:|^\/\//i.test(siguiente) &&
          (u.rol === 'admin' ? siguiente.startsWith('admin/') : siguiente.startsWith('cliente/'));
        if (permitido) Utils.ir(siguiente);
        else Utils.ir(u.rol === 'admin' ? 'admin/resumen.html' : 'cliente/panel.html');
      } catch (err) {
        AuthView.mostrarAlerta(err.message);
      }
    });
  },

  inicio() {
    const usuario = AppController.iniciar({ acceso: 'publico', pagina: 'inicio', titulo: 'Inicio' });
    AuthView.cargarFoto();
    InicioView.render(usuario);
    InicioView.bindEmpezar(() => {
      const actual = SesionModel.actual();
      if (actual?.rol === 'cliente') Utils.ir('cliente/servicios.html?nuevo=1');
      else if (actual?.rol === 'admin') Utils.ir('admin/resumen.html');
      else InicioView.abrirAcceso('cliente/servicios.html?nuevo=1');
    });
  },
};
