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
