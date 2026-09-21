# Cómo crear una plantilla nueva

Una plantilla es **una carpeta**. No se toca el core (`gift-core/`, `src/engine/`, `src/editor/`, `src/admin/`, backend).
"Carta de amor" (`src/templates/love-letter/`) se creó así, sin modificar el core.

## 1. Crear la carpeta

```
src/templates/mi-plantilla/
├── index.js          ← une las piezas (siempre igual)
├── manifest.js       ← metadatos
├── schema.js         ← campos editables
├── demo.js           ← contenido de ejemplo (catálogo, "Ver demo", tests)
├── Experience.jsx    ← la experiencia visual
├── styles.css        ← estilos con prefijo propio (ej. .mp-)
└── thumbnail.webp    ← (generado) miniatura para el admin
```

El nombre de la carpeta es el `id` (minúsculas y guiones). Las carpetas que empiezan con `_` se ignoran.

## 2. `index.js`

```js
import manifest from "./manifest.js";
import schema from "./schema.js";
import demo from "./demo.js";

export default { manifest, schema, demo, loadExperience: () => import("./Experience.jsx") };
```

## 3. `manifest.js`

```js
import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "mi-plantilla",                  // = nombre de la carpeta
  version: 1,                          // súbela si cambias el schema de forma incompatible
  name: "Mi plantilla",
  description: "Frase comercial de una línea.",
  occasions: ["amor", "cumpleanos"],   // chips en el admin
  defaultCollections: ["amor"],        // se agrega sola a estas colecciones la primera vez
  supportsMusic: true,
  soundtrack: "song",                  // campo de audio que controla el shell
  gate: "shell",                       // "shell" = pantalla "toca para abrir" común · "template" = la plantilla llama open()
  collectsResponses: [],               // ["rsvp"] si los visitantes confirman asistencia
  gateCopy: { eyebrow: "Tienes un regalo", title: "Para {recipientName}", fallbackTitle: "Para ti", button: "Toca para abrir" },
  theme: { background: "#0b0b0f", foreground: "#f6f3ee", accent: "#f5c451" },
});
```

## 4. `schema.js` (el editor, el portal y la validación salen de aquí)

```js
import { defineSchema, f } from "../../../gift-core/index.js";

export default defineSchema({
  version: 1,
  steps: [
    { id: "who", title: "Para quién es", portalTitle: "¿Para quién es la sorpresa?" },
    { id: "story", title: "Historia" },
    { id: "media", title: "Fotos y música" },
  ],
  fields: {
    recipientName: f.text({ label: "Nombre", required: true, max: 40, editorStep: "who" }),
    senderName: f.text({ label: "De parte de", max: 40, editorStep: "who" }),
    reasons: f.list({
      label: "Razones", itemLabel: "Razón", min: 5, max: 30, editorStep: "story",
      item: f.text({ max: 120 }),
    }),
    chapters: f.list({
      label: "Capítulos", itemLabel: "Capítulo", min: 3, max: 8, editorStep: "story",
      item: f.group({ fields: { title: f.text({ label: "Título", required: true }), photo: f.image({ label: "Foto" }), date: f.date({ label: "Fecha" }) } }),
    }),
    photos: f.images({ label: "Fotos", min: 1, max: 15, editorStep: "media" }),
    song: f.audio({ label: "Canción", editorStep: "media" }),
    accent: f.color({ label: "Color", default: "#e0467c", customerEditable: false }),
  },
});
```

**Tipos:** `text`, `textarea`, `date`, `number`, `select`, `toggle`, `color`, `image`, `images`, `video`, `audio`, `group`, `list`.
**Opciones de cada campo:** `label`, `description`, `placeholder`, `required`, `min`, `max`, `default`, `validate(value, { values })`, `editorStep`, `customerEditable` (false = el comprador no lo ve en el portal), `portalLabel`, `portalDescription`.
`recipientName` y `senderName` se guardan en columnas del regalo automáticamente.

## 5. `demo.js`

```js
import { demoMedia } from "../_demo-media/index.js";
const { media, refs, song } = demoMedia(["sunset", "coffee", "beach"]);

export default {
  gift: { recipientName: "Andrea", senderName: "Diego", content: { photos: refs, song, reasons: ["…"] } },
  media,
};
```

El demo **debe pasar la validación de publicación** (lo verifica el test de contrato).

## 6. `Experience.jsx`

Recibe **sólo** estas props:

| Prop | Qué es |
|---|---|
| `content` | Valores del schema ya preparados: defaults aplicados, nombres, fotos como `{ src, srcSet, width, height, placeholder }`, audio como `{ src }`. Nunca nombres de archivo. |
| `media` | Mapa crudo de assets (rara vez necesario) |
| `mode` | `"live"` · `"preview"` · `"demo"` · `"thumbnail"` (miniatura: sin audio, estado estático bonito) |
| `audio` | `play()`, `pause()`, `toggle()`, `duck()`/`unduck()` (para videos) |
| `onEvent` | `onEvent("completed")` cuando se llega al final |
| `env` | `{ tier: "low"|"medium"|"high", reducedMotion, isTouch }` |
| `opened` / `open` | Sólo con `gate: "template"`: llama `open()` **dentro del gesto** del usuario (desbloquea la música) y marca el elemento con `data-gift-open` |
| `respond` | `respond("rsvp", { name, answer: "yes"\|"maybe"\|"no", guests, message })` → Promise. Sólo si el manifest declara `collectsResponses: ["rsvp"]`. En preview/demo se simula sin guardar. El admin ve las respuestas en el editor → **Confirmaciones**. |

Reglas:
- **No** hacer fetch, **no** usar el router, **no** lógica de admin.
- **Una sola** plantilla para todos los tamaños: adapta la **composición** con media queries (`orientation: landscape and max-height: 520px`, `min-width: 700px`, `min-width: 1024px`). No crear versiones Mobile/Desktop.
- Touch y mouse equivalentes (hover sólo en `@media (hover: hover) and (pointer: fine)`).
- Respetar `env.reducedMotion` y `env.tier`. Animar sólo `transform`/`opacity`. Nada de crear nodos DOM sin límite.
- Usar `100dvh`/`100svh` y `var(--safe-top)` / `var(--safe-bottom)`.
- Importar las fuentes dentro de `Experience.jsx` (se cargan sólo con la plantilla).

Bloques reutilizables en `src/experience-kit/`: `Reveal`/`useInView`, `Photo`, `PhotoViewer`, `Particles` (`pollen`, `petals`, `hearts`, `sparkles`, `confetti`), `ConfettiBurst`, `Countdown`/`useCountdown`, `useAudioState` (reproductores propios: `audio.getPosition()`, `audio.seek()`), `MusicToggle` (lo pone el shell). Se agrega algo al kit sólo cuando lo usan 2+ plantillas. Motion (`motion/react`) está disponible.

## 7. Probar

```bash
npm run dev                          # frontend
npm test                             # contrato de plantillas (se aplica solo a la carpeta nueva)
open http://localhost:3000/dev/schema/mi-plantilla   # editor generado + validación en vivo
open http://localhost:3000/demo/mi-plantilla         # demo
npm run smoke -- mi-plantilla        # 5 tamaños: consola, audio antes del gesto, scroll horizontal
npm run templates:thumbnails -- mi-plantilla         # miniatura para el admin
```

En el admin: **Plantillas → Responsive** muestra el mismo regalo en 375×812, 390×844, 844×390, 768×1024 y 1440×900.

## 7 bis. Si es una invitación de boda

No empieces de cero: **`src/templates/_wedding-kit/`** ya trae los campos, los formatos
y los bloques que comparten todas las bodas (ver su `README.md`).

```js
// schema.js de un diseño de boda
import { defineSchema } from "../../../gift-core/index.js";
import { steps, w } from "../_wedding-kit/fields.js";

export default defineSchema({
  version: 1,
  steps: steps("couple", "guest", "event", "details", "rsvp", "media"),
  fields: {
    brideName: w.bride(),
    groomName: w.groom(),
    recipientName: w.guestName(),
    passes: w.passes(),
    eventDate: w.weddingDate(),
    eventTime: w.ceremonyTime(),
    venueName: w.ceremonyVenue(),
    address: w.ceremonyAddress(),
    rsvpEnabled: w.rsvpEnabled(),
    // …y lo propio del diseño (sellos, marcos, paletas).
  },
});
```

En `Experience.jsx` usa `EventBlock`, `Timeline`, `RsvpForm` y `PhotoShare`, importa
`_wedding-kit/wedding-kit.css` y define en tu elemento raíz las variables `--wk-*`
(colores y tipografías). En `manifest.js`: `defaultCollections: ["boda"]` y
`collectsResponses: ["rsvp"]`.

Diseños ya hechos como referencia: `wedding-gold`, `wedding-navy`, `wedding-classic`
y `wedding-greenery`.

## 7 ter. Si es una tarjeta de político

Igual que las bodas: **`src/templates/_politician-kit/`** trae el schema completo
(`politicianSchema()`), el manifest base, la validación de links por red, las campañas y un demo.
Un diseño sólo agrega sus colores y su composición. Ver su `README.md`.

Una tarjeta sin "toca para abrir" (`gate: "template"` sin música) marca su elemento raíz con `data-gift-static`
para que `npm run smoke` no busque el botón de abrir. Referencia: `politico-cartel`.

Ojo: la lista `history` (campañas adicionales) es `customerEditable: false`; sólo el superadmin
la edita, el cliente llena una sola campaña (`campaign`).

## 8. Publicarla

Reinicia el backend: la plantilla aparece sola en **Plantillas** (activa) y en sus `defaultCollections`. Desde el admin puedes ocultarla, cambiar su nombre comercial, ordenarla y asignarla a otras colecciones. Queda disponible en el wizard, el editor y el portal del comprador sin más cambios.
