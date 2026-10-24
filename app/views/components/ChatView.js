/* =========================================================
   VISTA · Conversación entre cliente y asesor
   ========================================================= */

const ChatView = {
  abrir({ titulo, subtitulo }) {
    const modal = ModalView.abrir({
      eyebrow: 'Mensajes',
      titulo,
      subtitulo,
      tamano: 'sm',
      cuerpo: `
        <div class="chat" data-chat></div>
        <form class="chat__form" data-chat-form>
          <input class="input" name="texto" placeholder="Escribe un mensaje…" autocomplete="off">
          <button class="btn btn--dark" type="submit" aria-label="Enviar">${Icons.get('send', 'icon icon--sm')}</button>
        </form>`,
    });
    return modal;
  },

  /** Pinta los mensajes. "yo" es 'admin' o 'cliente'. */
  pintar(el, mensajes, yo) {
    const caja = el.querySelector('[data-chat]');
    caja.innerHTML = mensajes.length
      ? mensajes.map((m) => `
          <div class="chat__msg ${m.autor === yo ? 'is-mine' : ''}">
            ${Utils.esc(m.texto)}
            <small>${m.autor === 'admin' ? 'Asesor Vibra' : 'Cliente'} · ${Utils.momento(m.fecha)}</small>
          </div>`).join('')
      : '<p class="chat__empty">Aún no hay mensajes. ¡Escribe el primero!</p>';
    caja.scrollTop = caja.scrollHeight;
  },

  bindEnviar(el, handler) {
    const form = el.querySelector('[data-chat-form]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handler(form.texto.value);
      form.texto.value = '';
      form.texto.focus();
    });
  },
};
