# Kit de político

Todo lo que comparten las tarjetas de presentación de candidatos vive aquí. La carpeta empieza
con `_`, así que los registros de plantillas (frontend y backend) la ignoran: **no es una plantilla**.

| Archivo | Para qué sirve |
|---|---|
| `fields.js` | `politicianSchema()` (todos los campos), `politicianManifest()` y los pasos del editor. ESM puro (lo lee también el backend). |
| `networks.js` | Redes y links: etiquetas sugeridas, validación por red (`checkLink`) y `linkHref` (sólo https/tel/mailto). ESM puro. |
| `format.js` | Cuenta regresiva de la votación y `campaignList()` (junta y ordena las campañas). |
| `Icons.jsx` | Íconos de línea: redes, propuestas, calendario, reloj, play. |
| `demo.js` | `politicianDemo({ primary, accent })`: candidato, partido y equipo INVENTADOS. |
| `media/` | Ilustraciones del demo. Se regeneran con `node scripts/politician-media.mjs`. |

## Quién edita qué

- El **cliente** (portal): candidato, partido y número, día de votación, equipo, propuestas,
  links y **una** campaña (`campaign`).
- Sólo el **superadmin**: `history`, la lista de campañas adicionales (hasta 30).
  Es `customerEditable: false`: no aparece en el portal y el backend rechaza que el cliente la envíe.

En pantalla se muestran juntas: `campaignList(content)` devuelve `{ upcoming, past }`.

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

3. En `Experience.jsx`: `content.links` → `linkHref(item)` / `linkLabel(item)` / `<Icon name={iconOfNetwork(item.network)} />`;
   campañas → `campaignList(content)`; cuenta regresiva → `daysUntil(content.voteDate)` + `votingCountdownText()`.
   Usa `--pk-*` (con `colorPrimary` y `colorAccent` del contenido) y clases con prefijo `pk-`.
4. La colección **Política** ya existe en el backend (`services/catalog.js`).
