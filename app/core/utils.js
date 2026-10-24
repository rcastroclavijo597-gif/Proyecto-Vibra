/* =========================================================
   VIBRA · core/utils.js
   Utilidades compartidas: DOM, formato, fechas y navegación.
   Se cargan como scripts clásicos (sin módulos) para que el
   proyecto funcione abriendo los .html directamente.
   ========================================================= */

const Utils = {
  /* ---------- DOM ---------- */
  $(selector, root = document) { return root.querySelector(selector); },
  $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); },

  /** Escapa texto para insertarlo de forma segura en plantillas HTML. */
  esc(valor) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

  /** Crea un elemento a partir de un string HTML. */
  html(str) {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  },

  /* ---------- Navegación ---------- */
  /** Ruta relativa a la raíz del proyecto (definida en <body data-root>). */
  url(ruta = '') { return (document.body.dataset.root || '') + ruta; },
  ir(ruta) { window.location.href = Utils.url(ruta); },
  param(nombre) { return new URLSearchParams(window.location.search).get(nombre); },

  /* ---------- Formato de dinero ---------- */
  /**
   * Formatea euros al estilo español.
   * @param {number} n
   * @param {{decimales?: boolean, agrupar?: boolean}} op
   *  decimales → siempre 2 decimales (2.843,50 €)
   *  agrupar   → separador de miles también en números de 4 cifras (2.350 €)
   */
  euros(n, op = {}) {
    const num = Number(n) || 0;
    const conDecimales = op.decimales || (!Number.isInteger(Math.round(num * 100) / 100) && op.decimales !== false);
    const fijo = conDecimales ? Math.abs(num).toFixed(2) : String(Math.round(Math.abs(num)));
    let [entero, dec] = fijo.split('.');
    if (op.agrupar || entero.length > 4) entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${num < 0 ? '-' : ''}${entero}${dec ? ',' + dec : ''} €`;
  },

  /* ---------- Fechas (formato YYYY-MM-DD, sin zonas horarias) ---------- */
  MESES_CORTOS: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  MESES: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],

  partesFecha(iso) {
    if (!iso) return null;
    const [a, m, d] = iso.split('-').map(Number);
    return { a, m: m - 1, d };
  },
  /** "2026-06-14" → "14 jun 2026" */
  fecha(iso) {
    const p = Utils.partesFecha(iso);
    if (!p) return 'Por definir';
    return `${String(p.d).padStart(2, '0')} ${Utils.MESES_CORTOS[p.m]} ${p.a}`;
  },
  hoyISO() {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
  },
  isoDe(a, m, d) { return `${a}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; },
  /** Fecha y hora legibles para el historial de actividad. */
  momento(isoDateTime) {
    if (!isoDateTime) return '';
    const f = new Date(isoDateTime);
    const diff = (Date.now() - f.getTime()) / 1000;
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `${String(f.getDate()).padStart(2, '0')} ${Utils.MESES_CORTOS[f.getMonth()]} ${f.getFullYear()}`;
  },

  /* ---------- Texto ---------- */
  /** "Lucía Martín" → "LM", "Marta & Alex" → "M&", "Admin" → "A" */
  iniciales(nombre = '') {
    const limpio = nombre.trim();
    if (!limpio) return '?';
    if (limpio.includes('&')) return limpio[0].toUpperCase() + '&';
    const partes = limpio.split(/\s+/);
    return (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase();
  },
  plural(n, singular, plural) { return `${n} ${n === 1 ? singular : plural}`; },
  normalizar(s = '') { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); },
  emailValido(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email); },
  saludo() {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  },
};
