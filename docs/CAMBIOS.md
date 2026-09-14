# Registro de cambios por fase — Web (qralbumfront)

Plan completo: `../IMPLEMENTATION_PLAN.md`

## Fase 0 — Seguridad

- **Recargar la página ya no expulsa al login:** `AuthContext` lee la sesión de forma síncrona (antes `PrivateRoute` redirigía antes de que un `useEffect` restaurara el estado).
- **El rol ya no se confía a `localStorage`:** al iniciar se confirma con `GET /api/auth/me`.
- **Sesión expirada o inválida:** el interceptor de axios detecta `401` y cierra la sesión (vuelve a `/login`).
- `PrivateRoute` ya no navega a `/unauthorized` (ruta inexistente).

Verificación (Chrome, 390×844): login → `/clientes` → recarga mantiene la ruta; token inválido → `/login`. Build CRA pasa.

## Fase 3a — Migración de Create React App a Vite

**Por qué (cambio respecto a la auditoría):** CRA está deprecado y **no permite importar código fuera de `src/`**. El motor necesita `gift-core/` compartido con el backend y el auto-registro de plantillas con `import.meta.glob`, que CRA no ofrece.

- `vite` 8 + `@vitejs/plugin-react`; `index.html` en la raíz (`lang="es"`, `viewport-fit=cover`).
- Archivos con JSX renombrados a `.jsx`; `src/index.js` → `src/main.jsx`.
- `REACT_APP_API_URL` → `VITE_API_URL` (vacío = mismo origen). En desarrollo Vite reenvía `/api` y `/media` al backend (`VITE_API_PROXY`), sin CORS.
- `package.json` con `"type": "module"`; configs de Tailwind/PostCSS pasan a `.cjs`.
- Eliminados: `react-scripts`, `web-vitals`, `@testing-library/*`, test roto de CRA, `App.css`, `logo.svg`, `UploadModal.js` (sin uso), archivos vacíos (`ClienteDetail.js`, `utils/audioPlayer.js`).
- `.env` deja de versionarse (existe `.env.example`).
- Scripts: `npm run dev` (puerto 3000), `npm run build`, `npm run preview`, `npm test` (Vitest).

Verificación: build OK; admin actual probado en Chrome (login, dashboard, clientes) sin errores de consola.

## Fase 3 — Motor multiplantilla

### Qué cambió
- **`gift-core/`** (ESM puro, sin dependencias, compartido con el backend): `defineManifest`, `defineSchema`, DSL de campos `f.*`, `prepareContent` (defaults, nombres enlazados, resolución de media a `{ src, srcSet, width, height, placeholder }` sin nombres de archivo), `validateContent`, `collectAssetIds`.
- **`src/engine/`**
  - `registry.js`: registra **solas** las carpetas `src/templates/<id>/index.js` (`import.meta.glob`); ignora carpetas `_*`; valida que exporten `manifest`, `schema`, `demo`, `loadExperience` y que `manifest.id` coincida con la carpeta. Cada experiencia se carga diferida (chunk propio).
  - `TemplateRenderer.jsx`: `templateId` → registro → `prepareContent(schema)` → `ExperienceShell` → `Experience`.
  - `ExperienceShell.jsx`: carga/errores (error boundary), pantalla **"toca para abrir"** configurable por manifest (`gateCopy`, `theme`) o delegada a la plantilla (`gate: "template"` + `open()`), audio desbloqueado en el gesto (nunca autoplay), `MusicToggle`, pausa al ocultar pestaña, `data-tier`, `data-reduced-motion`, safe-area y `100dvh`, eventos (`opened`), pantalla completa opcional.
  - `audio.js` / `useAudio.js`: controlador de música (unlock, toggle, duck para videos, suspend/resume, cambio de pista en vivo).
  - `environment.js`: tier `low|medium|high`, reduced motion, touch, ahorro de datos.
- **Contrato de una plantilla** (lo único que recibe `Experience`): `content` (preparado), `media`, `mode` (`live|preview|demo|thumbnail`), `audio`, `onEvent`, `env`, `opened`, `open`. Una plantilla no hace fetch, no usa el router ni conoce el admin.
- **Rutas públicas** (sin Ant Design, carga diferida):
  - `/g/:slug` → `GiftPage` (única ruta de regalos; `document.title` con el nombre).
  - `/demo/:templateId` → demo con contenido de ejemplo.
  - `/frame` → destino del iframe de preview (recibe el regalo por `postMessage` del mismo origen).
  - `/c/:uuid` y `/:uuid` → redirección de links y QR legados.
- El admin anterior pasa a `src/admin/AdminApp.jsx` (lazy): antd, su reset CSS y Tailwind sólo se descargan en el admin.
- Plantilla `yellow-flowers` registrada: `manifest`, `schema` (definitivo), `demo` y una `Experience` inicial (la completa llega en la Fase 9).
- `src/templates/_demo-media/`: fotos ilustradas y melodía de caja musical **propias** (sin derechos de terceros), generadas por `scripts/generate-demo-media.mjs`.
- Eliminados: `PublicPage.jsx`, `PageClientesV2.jsx` (reemplazados por la plantilla), `react-slick`, `slick-carousel`.

### Tamaño de la experiencia pública
| | Antes (CRA) | Ahora |
|---|---|---|
| JS al abrir un regalo | 458 KB gzip (todo el admin incluido) | ~80 KB gzip (React + router + motor + plantilla) |

### Verificación
- `npm run build` OK · `npm test` (Vitest) 15/15 de `gift-core`.
- Chrome 390×844 (touch) y 1440×900: `/g/:slug` real creado vía API → pantalla de apertura → experiencia; **sin errores de consola**, **sin audio antes del toque**, música activa después, **no se descarga el admin**. `/demo/yellow-flowers` OK. `/c/<uuid>` y `/<uuid>` redirigen a `/g/:slug`. Slug inexistente muestra mensaje humano.
- Transitorio: el admin antiguo sigue funcionando; los clientes creados con él después de la migración no tienen regalo nuevo (se reemplaza en la Fase 5).

## Fase 4 — Sistema de schemas

### El mismo schema se usa para
1. **Generar el editor** → `src/editor/SchemaForm.jsx`
2. **Validar en el frontend** → `validateContent(schema, values, { mode })` de `gift-core`
3. **Validar en el backend** → el API importa el mismo `schema.js` de la plantilla y el mismo `gift-core`
4. **Preparar los datos de la plantilla** → `prepareContent(schema, gift, media)`

### DSL (`gift-core/fields.js`)
Tipos: `text`, `textarea`, `date`, `number`, `select`, `toggle`, `color`, `image`, `images`, `video`, `audio`, `group`, `list`.
Propiedades de cada campo: `label`, `description`, `placeholder`, `required`, `min`, `max`, `default`, `validate(value, { values })`, `editorStep`, `customerEditable`, `portalLabel`, `portalDescription` (+ `options`, `rows`, `fields`, `item`, `itemLabel` según el tipo).
Modos de validación: `draft` (forma y máximos, para autoguardado) y `publish` (además obligatorios y mínimos). Opción `keys` para limitar campos (portal) y `assets` para verificar que la media exista y sea del tipo correcto.

### Editor generado (`src/editor/`)
- `SchemaForm`: pasos → campos; vista `admin` o `customer` (usa `portalLabel`); errores por ruta (`chapters.2.title`); sin Ant Design (lo reutiliza el portal).
- Controles: texto con contador, textarea autoajustable, fecha, número, select nativo (mejor en móvil), switch, color, grupos y listas (agregar, eliminar, subir/bajar).
- **Fotos (`ImagesField`)**: selección múltiple, **cámara** en dispositivos táctiles, **preview inmediato**, **compresión en el navegador** (máx. 2560px JPEG), **progreso individual**, **reintento**, **reordenar** (mantener presionado en touch · arrastrar con mouse · teclado), **reemplazar**, **eliminar**, contador `7/12`, avisos claros al superar el máximo, primera foto marcada como portada. Hasta 3 subidas simultáneas.
- **Archivo único (`MediaField`)**: foto, canción o video con preview/reproductor, progreso, reintento, cambiar y quitar.
- Inputs de 16px (evita el zoom de iOS) y áreas táctiles ≥ 44px.
- **Playground de desarrollo** `/dev/schema/:templateId` (sólo `npm run dev`): editor generado + validación de publicación + valor saneado en vivo, con subida simulada.

### Tests de contrato de plantillas (`src/templates/templates.contract.test.js`)
Se aplican **solos** a cada carpeta nueva: registro, manifest completo, tipos y etiquetas del schema, pasos para el comprador, **el demo pasa la validación de publicación**, `prepareContent` resuelve toda la media, archivos obligatorios presentes.

### Verificación
- `npm test`: 22/22 · build OK.
- Chrome 390×844 y 1280×900 en el playground: contador y error de máximo, subida múltiple con progreso, error simulado con "Reintentar", eliminar, reordenar con mouse (orden verificado en el valor), vista comprador limitada a campos editables. Sin errores de consola.

## Fase 5 — Nuevo admin

### Qué cambió
Se reemplazó por completo el admin anterior (tabla de clientes con password, dashboard con ingresos simulados).

- **Navegación**: Inicio · Regalos · Clientes · Plantillas · Colecciones. Escritorio con sidebar; móvil con barra inferior y botón central "+" (pensado para crear regalos desde el celular durante un Live).
- **Inicio**: regalos totales, borradores, esperando contenido, publicados, aperturas; regalos recientes; plantillas más utilizadas.
- **Regalos** (`/admin/gifts`): galería visual con miniatura de la plantilla, destinatario, cliente, plantilla, estado y última edición. Búsqueda, estado (chips), colección, plantilla, cliente y rango de fechas (en móvil detrás de "Filtros"). Acciones: Editar, Preview, Copiar link, QR y compartir, Duplicar, Archivar/Restaurar.
- **Crear regalo (wizard)** (`/admin/gifts/new` → `/admin/gifts/:id/setup`):
  1. Colección (tarjetas grandes con portada o mosaico de plantillas)
  2. Plantilla (tarjetas con **preview animado real al pasar el mouse**, ocasiones, "Ver demo" en modal con iPhone/Escritorio)
  3. Información básica (quién recibe, quién envía, cliente con creación rápida, ocasión)
  4+. **Pasos generados automáticamente desde el schema** de la plantilla, con autoguardado y preview en vivo
  Final. Vista previa móvil/escritorio + Publicar
- **Editor** (`/admin/gifts/:id`): panel de personalización (detalles + `SchemaForm`) y **preview en vivo real** (iframe `/frame`) con 📱/🖥, opción de ver la pantalla de apertura y reiniciar. Indicador "Guardado ✓", autoguardado a los 700 ms, guardado al salir. En móvil: pestañas Editar/Preview y botón flotante "Ver preview".
- **Publicar**: valida con el schema antes de enviar; si falta algo muestra la lista y al tocar un ítem lleva al campo. Al publicar abre **link + QR descargable (PNG) + WhatsApp** (al número del cliente si existe).
- **Preview completo** (`/admin/gifts/:id/preview`): iPhone mini 375×812, iPhone 390×844, horizontal 844×390, iPad 768×1024, Escritorio 1440×900.
- **Clientes**: lista con nombre, WhatsApp, email, número de regalos, último regalo y fecha; alta **sin contraseña**. Detalle con perfil, regalos, actividad y "+ Crear regalo" (preselecciona el cliente).
- **Plantillas**: galería con preview animado, activar/ocultar, nombre/descripción comerciales, colecciones, uso, demo; vista "Ordenar" con arrastre.
- **Colecciones**: lista ordenable por arrastre, activar/desactivar, crear/editar (nombre, descripción, portada), asignar y ordenar plantillas.
- **Diseño**: Inter autoalojada, neutros cálidos, un acento, skeletons de carga, estados vacíos con acción, errores con reintento, `prefers-reduced-motion`. Ant Design sólo en el admin con tema propio.
- Medios eliminados: `chart.js`, `react-chartjs-2`, `react-icons`, `lucide-react`, Tailwind/PostCSS (el admin usa CSS propio).
- `VITE_PUBLIC_URL` (opcional): dominio usado en los links y QR que se comparten (en local conviene la IP de la red para probar desde el celular).

### Verificación
- `npm run build` OK · `npm test` 22/22.
- Recorrido completo en Chrome (1440×900 y 390×844) **sin errores de consola**: login → crear cliente → wizard (colección, plantilla con preview animado, datos) → pasos del schema (mensaje, 3 fotos, canción) → vista previa → publicar → QR → editor con autoguardado → listado con filtros → plantillas → colecciones → móvil (inicio, regalos, editor, preview) → `/g/:slug`.

## Fase 6 — Portal privado para que el cliente suba su contenido

- **Admin → "Solicitar contenido"** (menú de cada regalo, editor y paso final del wizard): elige qué completará el cliente (campos `customerEditable` del schema) y el vencimiento; genera y **copia** el link; botón **WhatsApp** con mensaje listo ("Hola Rosa 💛 Para preparar la sorpresa para Andrea necesito…"), estado (activo, enviado, vencido, desactivado), último uso y **desactivar**.
- **`/upload/:token`** (público, sin Ant Design, `noindex`):
  1. Bienvenida: "Estamos preparando una sorpresa para Andrea 💛"
  2. Wizard `1 de N` **generado desde el schema** sólo con los campos permitidos (`portalTitle` / `portalLabel`)
  3. Autoguardado con indicador; fotos con la misma subida del admin (múltiple, cámara, compresión, progreso, reintento, reordenar con toque largo, reemplazar, eliminar, límites)
  4. "Enviar contenido": valida lo que falta y lleva al paso correspondiente
  5. "¡Listo! 💛 Recibimos todo para preparar tu regalo."
  - Links inválidos, vencidos o desactivados muestran mensajes claros. Al recargar después de enviar se ve la pantalla de listo.
- El cliente **no ve** admin, precios, otros clientes ni otros regalos.

Verificación (Chrome, admin 1280×860 + celular táctil 390×844): admin genera el link → portal: bienvenida → nombre → mensaje → 4 fotos → canción → enviar → "¡Listo!"; el regalo queda `ready` con 4 fotos, canción y remitente. El portal no descarga código del admin. Sin errores de consola (salvo el 404 esperado del link inválido de prueba).

## Fase 7 — Preview responsive y herramientas

- **Laboratorio** `/admin/lab/:templateId` (botón "Responsive" en Plantillas): el **mismo regalo** a la vez en iPhone mini 375×812, iPhone 390×844, horizontal 844×390, iPad 768×1024 y Escritorio 1440×900. Fuente: contenido demo o **un regalo real** (por id). Modo "Uno" con selector de dispositivo, pantalla de apertura on/off y "Reiniciar todos".
- Cada marco es un iframe con el **viewport real**: la plantilla adapta su composición con media queries; no se escala la composición, sólo el marco.
- **`npm run smoke`** (`scripts/smoke.mjs`, playwright-core con Chrome del sistema): recorre cada plantilla (y opcionalmente `SMOKE_SLUG`) en los 5 tamaños; falla si hay errores de consola, excepciones, **audio antes del gesto**, **scroll horizontal** o no encuentra cómo abrir la experiencia (`.gs-gate__button` o `[data-gift-open]`). Capturas en `artifacts/smoke/` (fuera de git).
- **`npm run templates:thumbnails`**: genera `src/templates/<id>/thumbnail.webp` desde el render real del demo. El registro la detecta sola (sin editar `index.js`).
- `npm run demo:media`: regenera los medios de demo propios.

Verificación: build OK · `npm run smoke` 5/5 para yellow-flowers · laboratorio en Chrome con 5 iframes y sin errores.

## Fase 8 — ExperienceShell completo

- **Responsabilidades del shell** (toda experiencia pública pasa por él): carga (skeleton propio), error boundary con reintento, **"toca para abrir"** (texto y colores desde el manifest, o delegado a la plantilla con `gate: "template"` + `open()`), **desbloqueo de audio en el gesto** (nunca autoplay), `MusicToggle` flotante con safe-area, **pausa al ocultar la pestaña** y retoma al volver, `prefers-reduced-motion` (`env.reducedMotion` + `data-reduced-motion`), `100dvh` y variables `--safe-*`, **tier de rendimiento** (`env.tier`), pantalla completa opcional (`preferFullscreen`, sólo táctil y en vivo), color de la barra del navegador (`theme-color`) según la plantilla.
- **Eventos**: `opened`, `music_started` (cuando realmente suena) y `completed` (lo emite la plantilla). En `/g/:slug` se registran **una vez por sesión** (recargar no infla las aperturas). En preview/demo no se registra nada.
- `src/engine/audio.test.js`: sin reproducción antes de `unlock()`, suspender/retomar, duck para videos, cambio de pista.

Verificación: `npm test` 26/26 · build OK · en modo producción (backend sirviendo `dist`): `/g/:slug` en 390×844 abre, suena la música tras el toque, `theme-color` de la plantilla, admin y preview en iframe sin errores ni violaciones de CSP.
