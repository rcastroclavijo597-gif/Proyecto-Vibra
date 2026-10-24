# Vibra · Plataforma de servicios para eventos

Proyecto web en **HTML, CSS y JavaScript puro** organizado con el patrón **MVC (Modelo – Vista – Controlador)**.
No necesita instalar nada: abre `index.html` en el navegador (doble clic) y listo.
Los datos se guardan en el `localStorage` del navegador.

## Datos iniciales

El proyecto empieza **vacío**: no trae clientes ni eventos fijos. Todo lo que aparece lo crean los usuarios.
La única cuenta que existe desde el inicio es la del administrador:

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@gmail.com | admin123 |

Los clientes crean su propia cuenta desde **Crear cuenta**.
La píldora oscura de la esquina inferior izquierda es un navegador de vistas: salta entre pantallas y, con **Borrar todos los datos**, deja la app vacía otra vez (solo con la cuenta del administrador).

## Estructura

```
vibra/
├── index.html              Inicio (landing)
├── registro.html           Crear cuenta
├── login.html              Iniciar sesión
├── cliente/
│   ├── servicios.html      Paso 1 · ¿Qué necesita tu evento?
│   ├── detalles.html       Paso 2 · Háblanos de tu gran día
│   ├── revisar.html        Paso 3 · Revisa tu solicitud
│   └── panel.html          Panel del cliente (Todo bajo control)
├── admin/
│   ├── resumen.html        Panel de control
│   ├── solicitudes.html    Listado completo con búsqueda
│   ├── detalle.html        Detalle de una solicitud (?id=EV-1001)
│   ├── presupuesto.html    Crear presupuesto (?id=EV-1001)
│   ├── calendario.html     Calendario operativo
│   ├── facturacion.html    Cobros pendientes / Ingresos recibidos
│   └── clientes.html       Base de datos de clientes
├── assets/
│   ├── css/                fonts, base, layout, components, auth, admin, cliente
│   ├── fonts/              Manrope y Playfair Display (locales, licencia OFL)
│   └── img/                (vacía) aquí puedes poner tu foto de evento
└── app/
    ├── core/               utils, imágenes, iconos, catálogo, store (localStorage) y datos iniciales
    ├── models/             MODELOS: Usuario, Sesión, Solicitud, Cliente, Borrador, Foto
    ├── views/              VISTAS: generan el HTML dinámico de cada pantalla
    │   ├── components/     cabeceras, modales, tabla, formulario de evento, chat…
    │   └── admin/
    └── controllers/        CONTROLADORES: conectan vistas y modelos
        └── admin/
```

## Cómo se aplica MVC

- **Modelo** (`app/models`): reglas de negocio y datos. Validan, calculan totales e IVA, cambian estados y guardan en el `Store`. Nunca tocan el DOM.
- **Vista** (`app/views`): pintan la interfaz y exponen métodos `bindX(handler)` para avisar de lo que hace el usuario. Nunca guardan datos.
- **Controlador** (`app/controllers`): cada página llama a su controlador (por ejemplo `ResumenController.iniciar()`), que pide datos al modelo, se los pasa a la vista y responde a los eventos.

Ejemplo del flujo al pulsar **Guardar gestión** en el detalle:
`DetalleView` detecta el envío → `DetalleController.guardarGestion()` → `SolicitudModel.actualizar()` valida, registra la actividad y guarda → el controlador vuelve a pintar con `DetalleView.render()`.

Los scripts se cargan como scripts clásicos (no módulos ES) para que todo funcione abriendo los archivos directamente, sin servidor.

## Funcionalidades

- Registro e inicio de sesión con validación y control de acceso por rol.
- Solicitud en 3 pasos con autoguardado del borrador y configuración técnica por servicio.
- **Fotos del lugar:** en el paso 2 el cliente sube hasta 3 fotos (clic o arrastrar). Se achican automáticamente (máx. 1200 px, JPEG) y se guardan como texto Base64 dentro del evento. Se ven en la revisión, en el panel del cliente y en el detalle del administrador, que también puede subirlas o cambiarlas.
- Panel del cliente que se actualiza solo cuando el admin cambia algo (en otra pestaña), con propuesta para aceptar y chat con el asesor.
- Panel de control con métricas calculadas y filtros por estado.
- Crear, editar y eliminar eventos (modal "Crear evento manual"), con confirmación antes de borrar.
- Presupuesto con conceptos editables, subtotal, IVA 21 % y envío al cliente.
- Calendario mensual navegable (clic en un día vacío crea un evento ese día).
- Facturación por cobro pendiente / pagado y base de clientes con búsqueda y alta.

## Usar una foto real en el registro

Por defecto el panel derecho del registro muestra una ilustración hecha con CSS.
Para usar una foto: guárdala como `assets/img/evento.jpg` y en `registro.html`, `login.html` e `index.html` cambia `data-foto` por `data-foto="assets/img/evento.jpg"`.
