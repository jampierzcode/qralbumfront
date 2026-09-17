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

## Fase 9 — Plantilla "Flores amarillas" completa

`src/templates/yellow-flowers/` = `manifest.js` · `schema.js` · `demo.js` · `Experience.jsx` · `Garden.jsx` · `styles.css`.

**Narrativa (no una galería de archivos):**
1. **Portada**: girasoles que crecen (tallo → hojas → flor que se abre) y se mecen; polen dorado en canvas; "Para Andrea", título y "con cariño, Diego".
2. **La carta**: el mensaje aparece palabra por palabra al llegar; firma; **tiempo transcurrido** desde la fecha especial ("2 años, 11 meses y 24 días" o "Faltan N días").
3. **Recuerdos que florecen**: las fotos como polaroids con girasol, inclinadas y superpuestas; aparecen al hacer scroll; al tocar abren el visor (deslizar / teclado / flechas). Nunca se muestran nombres de archivo.
4. **Videos** (si hay, p. ej. álbumes legados): se reproducen inline y pausan la música.
5. **Final**: "Que nunca te falten flores", firma, ramo, pétalos cayendo, "Ver de nuevo" y evento `completed`.

**Composición adaptable (una sola plantilla, sin escalar):** móvil vertical 5 flores y recuerdos en columna escalonada · tablet 2 columnas · escritorio campo de 7 flores y collage de 3 columnas · horizontal corto con texto a la izquierda y jardín a la derecha. Touch y mouse equivalentes (hover sólo en punteros finos).

**Rendimiento:** cada flor ≈ 20 nodos y sólo anima `transform`; partículas en **canvas con tope** (máx. 70, 30 en gama baja) que se pausan fuera de pantalla y con la pestaña oculta; fotos con `srcSet`/`sizes` y placeholder difuminado (nunca originales); tier bajo usa 5 flores y sin pétalos. `prefers-reduced-motion` y modo miniatura muestran el estado final sin animaciones. Fuente Fraunces cargada sólo con esta plantilla.

**Eliminado del original** (`PageClientesV2`): ~150 nodos DOM sin CSS, CSS roto, partículas DOM ilimitadas, textos hardcodeados, galería de archivos con buscador por nombre de archivo, antd en el visor.

**Experience-kit** nuevo (reutilizado por Love Letter): `Reveal` + `useInView`, `Photo`, `PhotoViewer`, `Particles` (pollen, petals, hearts, sparkles).

Verificación: `npm run smoke` 5/5 · capturas revisadas en 390×844, 1440×900 y 844×390 · visor probado con teclado (escritorio) y deslizando (móvil) · sin errores de consola.

## Fase 10 — Segunda plantilla: "Carta de amor"

`src/templates/love-letter/` — deliberadamente distinta para probar el motor:

- **El sobre es la pantalla de apertura** (`gate: "template"`): fondo oscuro con destellos, "Para Sofía · Tengo algo para ti", sobre con sello de cera (inicial del remitente, color configurable). Al tocarlo la plantilla llama `open()` (desbloquea la música en el mismo gesto).
- Secuencia con **Motion**: el sello se rompe → la solapa se abre → la carta sale del sobre → el sobre se va → la carta aparece en papel.
- **Texto progresivo**: cada párrafo revela sus oraciones al llegar; saludo y firma manuscritos (Caveat), cuerpo en Cormorant Garamond.
- **Recuerdos** (3–8 fotos) que **caen sobre la mesa** como polaroids con resorte; visor al tocar.
- **Mensaje final** con corazones, sello, firma, "Volver a abrir el sobre" y evento `completed`.
- Schema con `text`, `textarea`, `date`, `images` (min 3 · max 8), `audio`, `select` (color del sello) y campos sólo del admin (`customerEditable: false`).
- Composición: móvil vertical (sobre centrado, mesa de 2 columnas) · horizontal (texto a la izquierda, sobre a la derecha, mesa de 4) · tablet (3) · escritorio (sobre de 520px, carta sobre escritorio, mesa de 4 con la última fila centrada).

**¿Hubo que modificar el core? No.** `git status` no muestra cambios en `gift-core/`, `src/engine/`, `src/editor/`, `src/admin/`, `src/public/` ni `src/portal/`. La plantilla se registró sola en el frontend y en el catálogo del backend (con sus colecciones sugeridas Amor y Aniversario), heredó editor, wizard, portal, validación, preview, laboratorio y tests de contrato.

- Miniaturas reales generadas para ambas plantillas (`thumbnail.webp`, viewport 4:3 con composición horizontal).
- `docs/CREAR_PLANTILLA.md`: guía paso a paso.

Verificación: `npm test` 32/32 (6 contratos nuevos automáticos) · `npm run smoke` 10/10 (2 plantillas × 5 tamaños) · secuencia del sobre revisada cuadro a cuadro en 390×844 · música activa tras tocar el sobre · sin errores de consola.

## Plantillas de cumpleaños + confirmación de asistencia

### Arreglos del admin
- Galería de Plantillas: las tarjetas podían montarse unas sobre otras; ahora encogen y los botones pasan a otra línea.
- Portadas de colección sin imagen: plantillas apiladas como tarjetas; colección vacía muestra "Próximamente".

### Cambio del core (documentado)
Las invitaciones necesitan que el invitado **responda** (confirmar asistencia) y eso no se podía expresar con `onEvent`:
- `manifest.collectsResponses` + prop `respond(type, payload)` para plantillas. `GiftPage` lo envía al API; en preview/demo se simula.
- `AudioController.getPosition()` / `seek()` para reproductores dentro de una plantilla.
- Experience-kit: `Countdown`/`useCountdown`, `ConfettiBurst`, partículas `confetti` multicolor, `useAudioState`.
- Admin: botón **Confirmaciones** en el editor (resumen Van / Tal vez / No van, lista, copiar lista, eliminar) para plantillas que reciben respuestas.

### `birthday` — Feliz cumpleaños (felicitación)
Portada con foto o video + botón de play (apertura) · "Hoy celebramos tu vida" con polaroid y frase manuscrita · Momentos con pestañas **Fotos / Mensajes de amigos** · cuenta regresiva a su cumpleaños · "Esta canción es para ti" con **reproductor propio** y nota "Te queremos" · final con globos, confeti, Ver todas las fotos / Leer mensajes / Compartir. Estilos **Clásico**, **Moderno (neón)** y **Minimalista**.

### `kids-party` — Súper cumpleaños (invitación infantil)
Temas **Superhéroes, Princesas, Dinosaurios, Espacio** (textos propios de cada tema y escenario SVG fijo detrás). Portada con la foto del niño en marco de cómic y "¡MATEO CUMPLE 6!" · mensaje en globos de diálogo · detalles de la misión (fecha, hora, lugar) · mapa con **Google Maps / Waze** · cuenta regresiva · **¿Vienes?**: nombre, cuántas personas, Sí / Tal vez / No (queda recordado en ese celular y se puede cambiar) · álbum · ¡Gracias! con WhatsApp para dudas.
Límite honesto: no hay ilustraciones de personajes como las del mockup (se usa la foto real del niño); se pueden sumar como fotos de portada si se consiguen.

Verificación: `npm test` 44/44 · `npm run smoke` 20/20 (4 plantillas × 5 tamaños) · e2e real: invitación publicada → invitado confirma desde el celular (3 personas) → recarga recuerda la confirmación → admin la ve en Confirmaciones. Sin errores de consola.

## Colección de bodas — 4 invitaciones + kit compartido

### `_wedding-kit/` — lo que comparten todas las bodas
Carpeta privada (empieza con `_`, los registros la ignoran). Un diseño nuevo de boda **no inventa campos**: elige de aquí los que usa, así el comprador siempre llena la misma información.

- `fields.js`: novios, foto, frase, mensaje de invitación · invitado, **número de accesos** y nota personal · ceremonia y recepción (hora, lugar, dirección, referencia, Maps) · dress code, itinerario, mesa de regalos, notas · confirmaciones (activar, fecha límite, WhatsApp) · galería, canción, hashtag, link para compartir fotos, mensaje final. Claves compatibles con la lista de invitados (`eventDate`, `eventTime`, `venueName`, `rsvpEnabled`).
- `format.js`: fechas largas en español, `28.11.27`, horas 12 h, monograma y links a **Google Maps, Waze, WhatsApp y Google Calendar**.
- Bloques: `EventBlock` (ceremonia/recepción), `Timeline` (itinerario), `RsvpForm` (nombre, accesos, mensaje, Sí/No, recuerda la respuesta en ese celular y ofrece WhatsApp), `PhotoShare` (QR al álbum de los invitados), `Icons`.
- `wedding-kit.css` (prefijo `wk-`) **sin colores propios**: cada diseño define `--wk-ink`, `--wk-accent`, `--wk-surface`, `--wk-input-bg`… y el mismo formulario se ve dorado, azul o verde.
- Media de demostración propia: novios, argollas, eucalipto, ramo, acuarelas azules, altar y primer baile (SVG generados con `npm run demo:media`).

### Las cuatro plantillas
- **`wedding-gold` · Boda dorada** — mármol con filigrana dorada y eucalipto: portada con sello para abrir, invitación con el pase del invitado, cuenta regresiva con "agendar el día", ceremonia y recepción, dress code, itinerario, mesa de regalos, confirmación y galería. Paletas dorado / oro rosa / esmeralda.
- **`wedding-navy` · Boda azul noche** — azul profundo con acuarelas: se abre tocando el **sello de cera** con las iniciales y cada detalle llega en su propia tarjeta en forma de arco. Sellos dorado / azul / vino.
- **`wedding-classic` · Boda clásica (menú)** — portada a sangre y **menú de accesos**: ceremonia, ubicación (Maps y Waze), itinerario, vestimenta, galería, mesa de regalos, notas y confirmación se abren en su propia pantalla (se cierran con ✕, el fondo o Esc). Acentos azul / olivo / vino.
- **`wedding-greenery` · Boda eucalipto** — **Save the date** con arco de eucalipto, invitación en tarjeta verde con monograma y número de accesos, y **"Comparte tus fotos"** con QR al álbum de los invitados. También entra en la colección Save the date.

### Catálogo
Colecciones nuevas **Boda** y **Save the date**; el backend las crea al arrancar (idempotente) para que una plantilla nueva caiga sola en su colección sin correr el seed a mano.

Verificación: `npm test` 68/68 (24 contratos nuevos automáticos) · `npm run smoke` 40/40 (8 plantillas × 5 tamaños) · miniaturas generadas del render real · backend 88/88 con los 4 schemas nuevos cargados desde el repositorio del frontend.

## Ramo de carritos

Plantilla nueva (`car-bouquet`) para los ramos de carritos de colección: **los carritos son las flores**.

- **Portada** oscura de garaje con "toca para abrir", botón de play y el ramo en penumbra (es la pantalla de apertura: desbloquea la música en el gesto).
- **El ramo se arma solo**: cada carrito crece desde el papel con un retardo distinto (`transform-origin` en el papel + `scaleY`), como florecen los girasoles de la otra plantilla.
- **Cada carrito guarda un mensaje**: se toca y abre su ficha (foto, nombre y mensaje) con ‹ ›, Esc y contador "3/6"; al descubrirlos todos, confeti.
- Después: **la carta** palabra por palabra, el **álbum** en polaroids con visor, los **videos** (bajan la música al reproducirse) y la meta con bandera a cuadros.
- Cuatro colores de ramo: azul neón, rojo fuego, verde nitro y morado. El papel, el moño, las hojas y las florecitas son SVG que leen esos colores.
- Toda la geometría del ramo (ancho de tarjeta, largo del tallo, radio del abanico) sale de una sola variable `--cb-w`, así se adapta de 375 px a escritorio sin deformarse; en apaisado el ramo se mide contra el alto disponible.
- El schema pide de 3 a 9 carritos (`foto + nombre + mensaje`), la carta, el álbum, la canción y los videos.

Las fotos de demostración son carritos reales recortados sin fondo (webp con transparencia) y viven en `src/templates/car-bouquet/media/`, no en `_demo-media`, porque sólo las usa esta plantilla.

Verificación: `npm test` 74/74 · `npm run smoke` 5/5 tamaños · editor generado y miniatura del render real · backend carga el schema sin cambios.

## Baby shower

Plantilla nueva (`baby-shower`): invitación mágica para darle la bienvenida al bebé, con **la paleta atada al género**.

- **Azul, rosado o los dos**: el campo `gender` (`boy` · `girl` · `surprise`) cambia el cielo, los adornos, los botones, el confeti y los textos ("un principito" / "una princesita" / "un bebé viene en camino"). `surprise` es para cuando todavía no se sabe: mezcla los dos colores.
- **Cielo de cuento** en SVG (`Scenery.jsx`): luna con halo, estrellas, globos que suben y un mar de nubes. Todo queda en la franja central del lienzo, que es lo que se ve en pantalla vertical (el `slice` recorta los lados).
- **Adornos de bebé flotando** detrás de la invitación: biberón, sonajero, osito, chupón, patucos, corona, mameluco y carriola. Cantidad fija (8) y sólo `transform`; se apagan con `prefers-reduced-motion`, en tier bajo y en apaisado.
- **Corona de rey/reina** sobre el medallón redondo de la foto (ecografía o pancita), con anillo punteado que gira lento.
- **Iconos propios** (`Icons.jsx`, 18 glifos SVG): biberón, chupón, sonajero, osito, patucos, carriola, mameluco, pañal, mantita, toallitas, corona, luna, estrella, nube, globo, corazón, regalo y los de fecha/hora/lugar.
- **Secciones**: portada · anuncio (con la fecha probable de nacimiento) · detalles con **código de vestimenta** · mapa (Google Maps y Waze) · cuenta regresiva · **mesa de regalos** (ideas + link) · confirmación de asistencia · álbum de la dulce espera · agradecimiento firmado por los papás.
- **Ideas de regalo con su icono**: si la idea dice "pañales", "biberones", "mantita" o "toallitas" se le pone el icono que le toca; si no, rota por la lista.
- **Confirmación (`respond("rsvp", …)`)**: nombre, cuántos vienen, un deseo para el bebé y Sí / Tal vez / No podré ir. Recuerda la respuesta en ese celular y ofrece WhatsApp para dudas.
- **Ilustración de portada por defecto** (`media/baby-boy.webp`, `media/baby-girl.webp`): la foto dejó de ser obligatoria. Si el comprador no sube ecografía ni foto de la pancita, el medallón muestra al bebé en azul o en rosado según el género. El demo usa la ilustración rosada.
- **Cielo con color de verdad**: la paleta se subió de tono (antes quedaba lavada y los títulos blancos no se leían) y el mar de nubes bajó para dejarle la pantalla al cielo. Los títulos llevan sombra en el tono profundo del género (`--bsh-deep`) y los chips sobre el cielo van en blanco sólido.
- Tipografías ya instaladas: Fraunces (títulos), Nunito (texto) y Caveat (los detalles escritos a mano).

### Catálogo
Colección nueva **Baby shower**; el backend la crea al arrancar (idempotente), igual que Boda y Save the date.

Verificación: `npm test` 80/80 · `npm run smoke` 5/5 tamaños (sin errores de consola, sin audio antes del gesto, sin scroll horizontal) · miniatura generada del render real · backend 88/88 con el schema nuevo.
