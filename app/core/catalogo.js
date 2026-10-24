/* =========================================================
   VIBRA · core/catalogo.js
   Datos fijos del negocio: servicios, estados y opciones.
   ========================================================= */

const Catalogo = {
  /*
   * Servicios. Los de tipo "cantidades" permiten elegir qué equipos
   * se necesitan y cuántos de cada uno. "precio" es el valor unitario
   * de referencia que se usa para armar la propuesta inicial.
   */
  SERVICIOS: [
    {
      id: 'sonido', nombre: 'Sonido profesional', icono: 'speaker', tono: 'purple',
      descripcion: 'Equipos de alta fidelidad adaptados a tu espacio.',
      config: {
        tipo: 'cantidades', label: '¿Qué equipos de sonido necesitas?',
        items: [
          { id: 'grande', nombre: 'Parlantes grandes', detalle: 'Activos de 15", para pista y exterior', precio: 90, max: 16 },
          { id: 'mediano', nombre: 'Parlantes medianos', detalle: '12", ideales para salones', precio: 60, max: 16 },
          { id: 'bajo', nombre: 'Bajos (subwoofers)', detalle: '18", refuerzan los graves', precio: 110, max: 8 },
          { id: 'monitor', nombre: 'Monitores de piso', detalle: 'Para artistas en tarima', precio: 45, max: 8 },
          { id: 'microfono', nombre: 'Micrófonos inalámbricos', detalle: 'Para discursos y brindis', precio: 30, max: 10 },
          { id: 'consola', nombre: 'Consola de mezcla', detalle: 'Digital, con técnico de sonido', precio: 150, max: 2 },
        ],
      },
    },
    {
      id: 'dj', nombre: 'DJ & animación', icono: 'disc', tono: 'teal',
      descripcion: 'Música, energía y animadores que conectan con todos.',
      config: null,
    },
    {
      id: 'iluminacion', nombre: 'Iluminación', icono: 'bulb', tono: 'orange',
      descripcion: 'Diseño lumínico que transforma cualquier ambiente.',
      config: {
        tipo: 'cantidades', label: '¿Qué tipo de luces necesitas?',
        items: [
          { id: 'pulpo', nombre: 'Pulpo LED', detalle: 'Rayos de colores en movimiento', precio: 55, max: 8 },
          { id: 'par', nombre: 'Luces LED fijas (PAR)', detalle: 'Iluminan paredes, mesas y tarima', precio: 20, max: 40 },
          { id: 'movil', nombre: 'Cabezas móviles', detalle: 'Haces que se mueven al ritmo', precio: 40, max: 24 },
          { id: 'laser', nombre: 'Láser', detalle: 'Figuras y rayos sobre el público', precio: 70, max: 6 },
          { id: 'estrobo', nombre: 'Luz estroboscópica', detalle: 'Destellos para los momentos clave', precio: 35, max: 6 },
          { id: 'bola', nombre: 'Bola de espejos', detalle: 'El clásico de la pista de baile', precio: 40, max: 4 },
        ],
      },
    },
    {
      id: 'efectos', nombre: 'Efectos especiales', icono: 'sparkles', tono: 'blue',
      descripcion: 'Humo, confeti, chispas frías y momentos inesperados.',
      config: {
        tipo: 'cantidades', label: '¿Qué efectos quieres?',
        items: [
          { id: 'humo', nombre: 'Máquina de humo', detalle: 'Ambiente para la pista', precio: 60, max: 6 },
          { id: 'chispas', nombre: 'Chispas frías', detalle: 'Ideales para el primer baile', precio: 50, max: 8 },
          { id: 'confeti', nombre: 'Cañón de confeti', detalle: 'Para la entrada o el brindis', precio: 45, max: 8 },
          { id: 'co2', nombre: 'Cañón de CO₂', detalle: 'Columnas de humo frío', precio: 80, max: 6 },
          { id: 'burbujas', nombre: 'Máquina de burbujas', detalle: 'Perfecta para fotos', precio: 30, max: 6 },
        ],
      },
    },
    {
      id: 'musica', nombre: 'Música en directo', icono: 'note', tono: 'pink',
      descripcion: 'Artistas y bandas para emocionar a tus invitados.',
      config: null,
    },
    {
      id: 'medida', nombre: 'Algo a medida', icono: 'plus', tono: 'grey',
      descripcion: 'Cuéntanos tu idea y diseñaremos una experiencia única.',
      config: { tipo: 'texto', label: 'Describe lo que imaginas' },
    },
  ],

  ESTADOS: {
    nueva: {
      label: 'Nueva', titulo: 'Nueva',
      mensajeCliente: 'Hemos recibido tu solicitud y nuestro equipo la revisará muy pronto.',
    },
    revision: {
      label: 'En revisión', titulo: 'En revisión',
      mensajeCliente: 'Estamos revisando los detalles y preparando tu propuesta.',
    },
    propuesta: {
      label: 'Propuesta enviada', titulo: 'Tienes una propuesta',
      mensajeCliente: 'Revisa la propuesta que preparamos para ti y acéptala cuando quieras.',
    },
    confirmada: {
      label: 'Confirmada', titulo: 'Evento confirmado',
      mensajeCliente: '¡Todo listo! Tu evento está confirmado y en nuestro calendario.',
    },
  },

  COBROS: { pendiente: 'Pendiente', pagado: 'Pagado' },

  TIPOS_EVENTO: ['Boda', 'Cumpleaños', 'Evento corporativo', 'Fiesta privada', 'Concierto', 'Otro'],
  INVITADOS: ['Menos de 50', '50 a 100', '100 a 200', 'Más de 200'],
  ESPACIOS: ['Interior', 'Exterior', 'Interior y exterior'],
  IVA: 0.21,

  servicio(id) { return Catalogo.SERVICIOS.find((s) => s.id === id); },

  /** Busca un equipo dentro de un servicio (p. ej. 'sonido' → 'bajo'). */
  equipo(servicioId, itemId) {
    return Catalogo.servicio(servicioId)?.config?.items?.find((i) => i.id === itemId) || null;
  },

  /**
   * Texto corto con la configuración elegida.
   * Ej.: [{id:'grande', cantidad:4}, {id:'bajo', cantidad:2}] → "Parlantes grandes ×4 · Bajos (subwoofers) ×2"
   */
  detalleServicio(item) {
    const v = item.config;
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) return 'Sin configuración adicional';
    if (typeof v === 'string') return v;
    return v.map((x) => {
      if (typeof x === 'string') return x; // datos de versiones anteriores
      const eq = Catalogo.equipo(item.id, x.id);
      return `${eq ? eq.nombre : x.id} ×${x.cantidad}`;
    }).join(' · ');
  },

  /** Valor de referencia de un servicio según los equipos elegidos (Σ cantidad × precio). */
  precioReferencia(item) {
    if (!Array.isArray(item.config)) return 0;
    return item.config.reduce((t, x) => t + (Catalogo.equipo(item.id, x.id)?.precio || 0) * (Number(x.cantidad) || 0), 0);
  },
};
