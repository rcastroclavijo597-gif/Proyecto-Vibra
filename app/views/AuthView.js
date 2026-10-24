/* =========================================================
   VISTA · Autenticación (registro e inicio de sesión)
   ========================================================= */

const AuthView = {
  form() { return document.getElementById('form-auth'); },

  /** Mostrar/ocultar contraseña con el icono del ojo. */
  bindVerPassword() {
    Utils.$$('[data-ver-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        const visible = input.type === 'text';
        input.type = visible ? 'password' : 'text';
        btn.innerHTML = Icons.get(visible ? 'eye' : 'eyeOff');
        btn.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
      });
    });
  },

  /**
   * Foto del panel visual. Por defecto se muestra la ilustración CSS del concierto.
   * Para usar una foto real: guárdala en assets/img/ y escribe su ruta en el
   * atributo data-foto del HTML, p. ej. data-foto="assets/img/evento.jpg".
   */
  cargarFoto() {
    Utils.$$('[data-foto]').forEach((visual) => {
      if (!visual.dataset.foto) return;
      const src = Utils.url(visual.dataset.foto);
      const img = new Image();
      img.onload = () => {
        visual.querySelector('.stage__photo').style.backgroundImage = `url('${src}')`;
        visual.classList.add('has-photo');
      };
      img.src = src;
    });
  },

  /** Rellena el correo (al venir del registro) y pone el foco en la contraseña. */
  precargarEmail(email) {
    if (!email) return;
    const form = AuthView.form();
    form.email.value = email;
    form.password.focus();
  },

  bindEnviar(handler) {
    const form = AuthView.form();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handler(FormView.leer(form));
    });
  },

  mostrarErrores(campos) {
    AuthView.ocultarAlerta();
    FormView.mostrarErrores(AuthView.form(), campos);
  },

  mostrarAlerta(mensaje) {
    AuthView.ocultarAlerta();
    AuthView.form().insertAdjacentHTML('afterbegin', `<div class="form-alert" role="alert">${Utils.esc(mensaje)}</div>`);
  },

  ocultarAlerta() { AuthView.form().querySelector('.form-alert')?.remove(); },

  ocupado(estado) {
    const btn = AuthView.form().querySelector('[type=submit]');
    btn.disabled = estado;
  },
};

/* =========================================================
   VISTA · Inicio (landing)
   ========================================================= */
const InicioView = {
  render(usuario) {
    const nav = document.getElementById('landing-nav');
    if (!usuario) return;
    const destino = usuario.rol === 'admin' ? 'admin/resumen.html' : 'cliente/panel.html';
    nav.innerHTML = `<a class="btn btn--dark" href="${Utils.url(destino)}">${usuario.rol === 'admin' ? 'Ir a administración' : 'Mi panel'}</a>`;
  },

  /** Clic en "Empezar mi evento". */
  bindEmpezar(handler) {
    document.getElementById('hero-cta').addEventListener('click', (e) => { e.preventDefault(); handler(); });
  },

  /** Modal para elegir entre iniciar sesión o crear cuenta. */
  abrirAcceso(destino) {
    const next = encodeURIComponent(destino);
    ModalView.abrir({
      eyebrow: 'Empieza tu evento',
      titulo: 'Primero, entra a tu cuenta',
      tamano: 'sm',
      autofoco: false,
      cuerpo: `
        <p class="confirm-text">Para crear tu solicitud necesitas una cuenta. Así podrás seguir el estado de tu evento y recibir la propuesta en tu panel.</p>
        <div class="stack mt-16" style="gap:10px">
          <a class="btn btn--mint btn--block" href="${Utils.url(`login.html?next=${next}`)}">Iniciar sesión ${Icons.get('arrowRight', 'icon icon--sm')}</a>
          <a class="btn btn--outline btn--block" href="${Utils.url(`registro.html?next=${next}`)}">Crear cuenta</a>
        </div>`,
    });
  },
};
