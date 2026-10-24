/* =========================================================
   VIBRA · core/store.js
   Capa de persistencia (localStorage). Los modelos son los
   únicos que deben hablar con el Store.

   Cada tipo de dato se guarda en su propia clave, para que en
   F12 → Application → Local Storage se vea con su nombre:

     vibra_usuarios    → cuentas (admin y clientes)
     vibra_clientes    → fichas de la pestaña "Clientes"
     vibra_eventos     → solicitudes / eventos
     vibra_secuencia   → próximo número de evento (EV-1001, EV-1002…)
     vibra_resumen     → totales del "Panel de control" (se calcula solo)
   ========================================================= */

const Store = {
  /** Nombre de la colección dentro del programa → clave en localStorage */
  CLAVES: {
    usuarios: 'vibra_usuarios',
    clientes: 'vibra_clientes',
    solicitudes: 'vibra_eventos',
    secuencia: 'vibra_secuencia',
  },
  RESUMEN: 'vibra_resumen',
  /** Claves de versiones anteriores (todo en una sola caja) */
  ANTIGUAS: ['vibra_db_v1', 'vibra_db_v2'],
  /** Versión del formato de datos (3 = sin clientes ni eventos de ejemplo) */
  VERSION: { clave: 'vibra_version', actual: '3' },

  /** Lee todas las claves y arma un solo objeto { usuarios, clientes, solicitudes, secuencia }. */
  cargar() {
    Store.migrar();
    if (localStorage.getItem(Store.CLAVES.solicitudes) === null) {
      const datos = Seed.datos(); // primera vez: solo la cuenta del administrador
      Store.guardar(datos);
      return datos;
    }
    try {
      const db = {};
      Object.entries(Store.CLAVES).forEach(([nombre, clave]) => {
        db[nombre] = JSON.parse(localStorage.getItem(clave));
      });
      if (!Array.isArray(db.usuarios) || !Array.isArray(db.clientes) || !Array.isArray(db.solicitudes)) {
        throw new Error('Faltan colecciones');
      }
      db.secuencia = Number(db.secuencia) || 1001;
      return db;
    } catch (e) {
      console.warn('Datos corruptos, se restablecen.', e);
      const datos = Seed.datos();
      Store.guardar(datos);
      return datos;
    }
  },

  /** Guarda cada colección en su clave (como JSON) y actualiza el resumen. */
  guardar(db) {
    Store.escribir(() => {
      Object.entries(Store.CLAVES).forEach(([nombre, clave]) => {
        localStorage.setItem(clave, JSON.stringify(db[nombre]));
      });
      localStorage.setItem(Store.RESUMEN, JSON.stringify(Store.calcularResumen(db)));
    });
  },

  /**
   * Ejecuta escrituras en localStorage. Si el navegador se queda sin espacio
   * (unos 5 MB, sobre todo por las fotos) lanza un error entendible.
   */
  escribir(fn) {
    try {
      fn();
    } catch (e) {
      if (e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)) {
        throw new Error('No hay espacio suficiente en el navegador. Quita alguna foto o elimina eventos antiguos.');
      }
      throw e;
    }
  },

  /** Espacio aproximado que usa Vibra en localStorage, en KB. */
  espacioUsadoKB() {
    let total = 0;
    Object.keys(localStorage).filter((k) => k.startsWith('vibra_'))
      .forEach((k) => { total += (k.length + (localStorage.getItem(k) || '').length) * 2; });
    return Math.round(total / 1024);
  },

  /**
   * Totales que muestra el Panel de control. Se guardan solo para poder
   * verlos en Local Storage; la app siempre los recalcula desde los eventos.
   */
  calcularResumen(db) {
    const suma = (lista) => lista.reduce((t, s) => t + (Number(s.precio) || 0), 0);
    const pendientes = db.solicitudes.filter((s) => s.cobro === 'pendiente');
    const pagados = db.solicitudes.filter((s) => s.cobro === 'pagado');
    return {
      solicitudesNuevas: db.solicitudes.filter((s) => s.estado === 'nueva').length,
      eventosActivos: db.solicitudes.length,
      pendienteDeCobro: suma(pendientes),
      eventosPendientes: pendientes.length,
      facturacion: suma(pagados),
      eventosPagados: pagados.length,
      totalClientes: db.clientes.length,
      actualizado: new Date().toISOString(),
    };
  },

  /** Devuelve una copia de la colección indicada. */
  tabla(nombre) { return Store.cargar()[nombre] || []; },

  /** Abre la base, aplica cambios con fn(db) y la vuelve a guardar. */
  transaccion(fn) {
    const db = Store.cargar();
    const resultado = fn(db);
    Store.guardar(db);
    return resultado;
  },

  /**
   * Si existen datos de la versión anterior (todo en "vibra_db_v1/v2"),
   * los reparte en las claves nuevas y borra la clave vieja.
   * Los datos de v1 tienen otro formato de servicios, así que se descartan.
   */
  migrar() {
    const vieja = localStorage.getItem('vibra_db_v2');
    if (vieja && localStorage.getItem(Store.CLAVES.solicitudes) === null) {
      try { Store.guardar(JSON.parse(vieja)); } catch { /* si está dañada, se empieza de cero */ }
    }
    Store.ANTIGUAS.forEach((k) => localStorage.removeItem(k));
    Store.quitarEjemplos();
  },

  /**
   * Una sola vez: borra los clientes, eventos y la cuenta de ejemplo que
   * traían versiones anteriores, y conserva todo lo que creó el usuario.
   */
  quitarEjemplos() {
    const { clave, actual } = Store.VERSION;
    if (localStorage.getItem(clave) === actual) return;
    if (localStorage.getItem(Store.CLAVES.solicitudes) !== null) {
      try {
        const leer = (k) => JSON.parse(localStorage.getItem(Store.CLAVES[k])) || [];
        const viejos = Seed.ANTIGUOS;
        const minus = (lista) => lista.map((x) => x.toLowerCase());
        Store.guardar({
          usuarios: leer('usuarios').filter((u) => !minus(viejos.usuarios).includes(u.email.toLowerCase())),
          clientes: leer('clientes').filter((c) => !minus(viejos.clientes).includes(c.email.toLowerCase())),
          solicitudes: leer('solicitudes').filter((e) => !viejos.solicitudes.includes(e.id)),
          secuencia: Number(JSON.parse(localStorage.getItem(Store.CLAVES.secuencia))) || 1001,
        });
      } catch { /* si algo está dañado, cargar() lo restablece */ }
    }
    localStorage.setItem(clave, actual);
  },

  /** Borra todos los datos: la app vuelve a empezar solo con la cuenta del administrador. */
  reiniciar() {
    [...Object.values(Store.CLAVES), Store.RESUMEN, ...Store.ANTIGUAS, 'vibra_sesion', 'vibra_borrador']
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem('vibra_sesion');
  },

  /**
   * Avisa cuando otra pestaña cambia los datos (tiempo real entre paneles).
   * Un guardado escribe varias claves; se agrupan en un solo aviso.
   */
  alCambiar(callback) {
    const propias = [...Object.values(Store.CLAVES), Store.RESUMEN];
    let pendiente = false;
    window.addEventListener('storage', (e) => {
      if (e.key !== null && !propias.includes(e.key)) return;
      if (pendiente) return;
      pendiente = true;
      setTimeout(() => { pendiente = false; callback(); }, 30);
    });
  },
};
