# Kit de bodas

Todo lo que comparten las invitaciones de boda vive aquí. La carpeta empieza con `_`,
así que los registros de plantillas (frontend y backend) la ignoran: **no es una plantilla**.

| Archivo | Para qué sirve |
|---|---|
| `fields.js` | Los campos que llena el vendedor/comprador: novios, invitado, ceremonia, recepción, dress code, itinerario, mesa de regalos, confirmaciones, fotos y música. ESM puro (lo lee también el backend). |
| `format.js` | Fechas en español, horas, monograma y links (Maps, Waze, WhatsApp, Google Calendar). |
| `Icons.jsx` | Iconos de línea (argollas, iglesia, copa, reloj, pin, vestido, cámara, regalo…). |
| `EventBlock.jsx` | Tarjeta de "Ceremonia" / "Recepción" con hora, lugar y cómo llegar. |
| `Timeline.jsx` | Itinerario del día. |
| `RsvpForm.jsx` | Confirmación de asistencia (nombre, accesos, mensaje) + WhatsApp. |
| `PhotoShare.jsx` | "Comparte tus fotos": QR al álbum de los invitados. |
| `wedding-kit.css` | Estilos con prefijo `wk-`, **sin colores propios**. |

## Cómo agregar un diseño de boda nuevo

1. Crea `src/templates/<id>/` con los 6 archivos de siempre (ver `docs/CREAR_PLANTILLA.md`).
2. En `schema.js` **elige campos de este kit** en vez de inventar claves nuevas:

```js
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
    // …y lo propio del diseño: sellos, colores, marcos.
  },
});
```

Usar las claves recomendadas (`eventDate`, `eventTime`, `venueName`, `rsvpEnabled`) mantiene
funcionando la lista de invitados y las confirmaciones sin tocar el backend.

3. En `Experience.jsx` arma la composición con los bloques del kit y define las variables
de color en tu elemento raíz — el kit las hereda:

```css
.mi-boda {
  --wk-ink: #2b2a26;
  --wk-soft: #7b7568;
  --wk-accent: #b08d57;
  --wk-on-accent: #fff;
  --wk-surface: rgba(255, 255, 255, 0.92);
  --wk-line: rgba(0, 0, 0, 0.12);
  --wk-radius: 18px;
  --wk-display: "Cormorant Garamond Variable", serif;
  --wk-body: "Inter Variable", sans-serif;
}
```

4. En `manifest.js`: `defaultCollections: ["boda"]` y `collectsResponses: ["rsvp"]`.
