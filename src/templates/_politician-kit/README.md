# Kit de político

Todo lo que comparten las tarjetas de presentación de candidatos vive aquí. La carpeta empieza
con `_`, así que los registros de plantillas (frontend y backend) la ignoran: **no es una plantilla**.

| Archivo | Para qué sirve |
|---|---|
| `fields.js` | `politicianSchema()` (todos los campos), `politicianManifest()` y los pasos del editor. ESM puro (lo lee también el backend). |
| `networks.js` | Redes y links: etiquetas sugeridas, validación por red (`checkLink`) y `linkHref` (sólo https/tel/mailto). ESM puro. |
| `format.js` | Cuenta regresiva de la votación, `campaignList()` (junta y ordena las campañas), fechas cortas y ayudas de color (`contrastColor`, `readableOnLight`, `visibleOn`, `mixHex`). |
| `Icons.jsx` | Íconos de línea: redes, propuestas, calendario, reloj, play, pin. |
| `Links.jsx` · `Team.jsx` · `Proposals.jsx` · `CampaignCard.jsx` · `PartyMark.jsx` | Bloques de contenido ya armados (estructura, sin colores). |
| `useCutout.js` | Detecta si la foto del candidato es un recorte con fondo transparente o una foto normal, para que el diseño se adapte. |
| `politician-kit.css` | Estilos de los bloques (prefijo `pk-`). Leen `--pk-*` que define cada diseño. |
| `demo.js` | `politicianDemo({ primary, accent })`: candidato, partido y equipo INVENTADOS. |
| `media/` | Ilustraciones del demo. Se regeneran con `node scripts/politician-media.mjs`. |

## Quién edita qué

- El **cliente** (portal): candidato, partido y logo, día de votación, equipo, propuestas,
  links y **una** campaña (`campaign`).
- Sólo el **superadmin**: `history`, la lista de campañas adicionales (hasta 30).
  Es `customerEditable: false`: no aparece en el portal y el backend rechaza que el cliente la envíe.

En pantalla se muestran juntas: `campaignList(content)` devuelve `{ upcoming, past }`.

## Diseños hechos

| Diseño | Idea | Colores por defecto |
|---|---|---|
| `politico-cartel` | Cartel de campaña: color del partido, foto grande del candidato sobre una **foto de fondo** que se mezcla (multiplicar) con ajustes editables, cuenta regresiva. | azul y ámbar |
| `politico-cedula` | Papel y tipografía de imprenta: cédula de votación de portada, X que se dibuja sola, boleto con talón. | carmesí y azul marino |

Los dos usan `politicianSchema()` y piden los mismos campos base (lo verifica `politician-kit.test.js`); cada uno puede sumar un *extra*:

- `extras: ["background"]` (Cartel): foto de fondo con modo de mezcla, opacidad, saturación, contraste, brillo, desenfoque y encuadre. El color del texto de la portada se recalcula según el fondo que resulta (`blendedBackdrop` + `usePhotoMean`), para que se lea aunque el cliente mueva los ajustes.
- `extras: ["ballot"]` (Cédula): interruptor `ballotShowPhoto` para mostrar la foto del candidato en la cédula.

**No hay número de votación.** En Perú se marca el **símbolo (logo) del partido**; las cédulas de las elecciones regionales y municipales 2026 ni siquiera llevan foto del candidato, por eso `ballotShowPhoto` nace apagado. La cédula de la portada es "Imagen referencial" y no usa siglas ni escudos oficiales.

## Cómo agregar un diseño nuevo

1. Crea `src/templates/<id>/` con los 6 archivos de siempre (ver `docs/CREAR_PLANTILLA.md`).
2. Reusa el kit; el diseño sólo pone lo suyo (colores por defecto, portada, estilos):

```js
// schema.js
import { politicianSchema } from "../_politician-kit/fields.js";
export default politicianSchema({ primary: "#0b57d0", accent: "#ffb300" });

// manifest.js
import { politicianManifest } from "../_politician-kit/fields.js";
export default politicianManifest({ id: "mi-diseno", name: "Mi diseño", description: "…", theme: { background: "#0b57d0", foreground: "#fff", accent: "#ffb300" } });

// demo.js
import { politicianDemo } from "../_politician-kit/demo.js";
export default politicianDemo({ primary: "#0b57d0", accent: "#ffb300" });
```

3. En `Experience.jsx` no hay "toca para abrir": marca el elemento raíz con `data-gift-static` (lo pide `npm run smoke`)
   y llama a `open()` al montar. Colores del partido: pasa por `contrastColor()` el texto sobre el color principal y por
   `readableOnLight()` el color usado como texto sobre blanco (un partido amarillo no debe dar texto amarillo sobre blanco).
   Referencias: `politico-cartel` (cartel, color del partido) y `politico-cedula` (papel, cédula con la X que se dibuja).
   Contenido: `content.links` → `linkHref(item)` / `linkLabel(item)` / `<Icon name={iconOfNetwork(item.network)} />`;
   campañas → `campaignList(content)`; cuenta regresiva → `daysUntil(content.voteDate)` + `votingCountdownText()`.
   Usa `--pk-*` (con `colorPrimary` y `colorAccent` del contenido) y clases con prefijo `pk-`.
4. La colección **Política** ya existe en el backend (`services/catalog.js`).
