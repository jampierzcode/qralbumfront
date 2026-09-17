// Campos comunes de TODA invitación de boda.
// ESM puro y sin dependencias: lo importan los schema.js de cada diseño y, desde ahí,
// también el backend (validación) y el portal del comprador.
//
// Un diseño nuevo de boda NO inventa campos: elige de aquí los que usa y así el
// comprador siempre llena la misma información, sin importar el diseño que compre.
import { f } from "../../../gift-core/index.js";

const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;
const LINK = /^https:\/\/\S+$/i;

const time = (label, extra = {}) =>
  f.text({
    label,
    description: "Formato 24 horas, ej. 17:30",
    placeholder: "17:30",
    max: 5,
    validate: (v) => (v && !TIME.test(v) ? "La hora debe tener formato 24 h, por ejemplo 17:30." : undefined),
    ...extra,
  });

const link = (label, extra = {}) =>
  f.text({
    label,
    max: 300,
    validate: (v) => (v && !LINK.test(v) ? "Pega un link que empiece con https://" : undefined),
    ...extra,
  });

/** Pasos del editor/portal compartidos por las bodas. Se usan en este orden. */
export const WEDDING_STEPS = Object.freeze({
  couple: { id: "couple", title: "Los novios", portalTitle: "¿Quiénes se casan?" },
  guest: { id: "guest", title: "El invitado", portalTitle: "¿A quién va dirigida?" },
  event: { id: "event", title: "Ceremonia y fiesta", portalTitle: "¿Cuándo y dónde es?" },
  details: { id: "details", title: "Detalles", portalTitle: "Detalles para tus invitados" },
  rsvp: { id: "rsvp", title: "Confirmaciones", portalTitle: "Confirmación de asistencia" },
  media: { id: "media", title: "Fotos y música", portalTitle: "Fotos y música" },
});

/** steps("couple", "guest", …) → los pasos en el orden pedido. */
export function steps(...ids) {
  return ids.map((id) => {
    const step = WEDDING_STEPS[id];
    if (!step) throw new Error(`Paso de boda desconocido: "${id}".`);
    return step;
  });
}

/**
 * Campos de boda. Cada uno acepta overrides: w.bride({ required: false }).
 * Las claves recomendadas están en el comentario de cada campo: usarlas tal cual
 * mantiene compatible la lista de invitados y las confirmaciones.
 */
export const w = {
  // ── Los novios ────────────────────────────────────────────────────────────
  /** clave: brideName */
  bride: (o = {}) =>
    f.text({ label: "Novia", portalLabel: "Nombre de la novia", placeholder: "Valentina", required: true, max: 24, editorStep: "couple", ...o }),
  /** clave: groomName */
  groom: (o = {}) =>
    f.text({ label: "Novio", portalLabel: "Nombre del novio", placeholder: "Sebastián", required: true, max: 24, editorStep: "couple", ...o }),
  /** clave: coverPhoto */
  coverPhoto: (o = {}) =>
    f.image({ label: "Foto principal", portalLabel: "Su mejor foto juntos", description: "Vertical se ve mejor. Es lo primero que aparece.", required: true, editorStep: "couple", ...o }),
  /** clave: quote · frase corta de portada */
  quote: (o = {}) =>
    f.text({ label: "Frase de portada", default: "Juntos en un lugar hermoso para siempre", placeholder: "Juntos en un lugar hermoso para siempre", max: 70, editorStep: "couple", ...o }),
  /** clave: inviteMessage */
  inviteMessage: (o = {}) =>
    f.textarea({
      label: "Mensaje de invitación",
      portalLabel: "¿Qué quieren decirle a sus invitados?",
      default: "Con la bendición de Dios y de nuestros padres, nos hace muy felices invitarte a celebrar nuestra boda.",
      max: 320,
      rows: 3,
      editorStep: "couple",
      ...o,
    }),

  // ── El invitado ───────────────────────────────────────────────────────────
  /** clave: recipientName (columna del regalo) */
  guestName: (o = {}) =>
    f.text({ label: "Invitado/a", portalLabel: "¿A quién va dirigida esta invitación?", placeholder: "Familia Ramírez", required: true, max: 40, editorStep: "guest", ...o }),
  /** clave: passes · cuántas personas cubre la invitación */
  passes: (o = {}) =>
    f.number({ label: "Número de accesos", description: "Cuántas personas cubre esta invitación.", default: 2, min: 1, max: 20, editorStep: "guest", ...o }),
  /** clave: guestNote · línea personal para ese invitado */
  guestNote: (o = {}) =>
    f.text({ label: "Nota para el invitado", portalLabel: "Una línea sólo para esta persona (opcional)", placeholder: "No podríamos imaginar este día sin ti.", max: 120, editorStep: "guest", ...o }),

  // ── Ceremonia ─────────────────────────────────────────────────────────────
  /** clave: eventDate */
  weddingDate: (o = {}) => f.date({ label: "Fecha de la boda", required: true, editorStep: "event", ...o }),
  /** clave: eventTime */
  ceremonyTime: (o = {}) => time("Hora de la ceremonia", { required: true, editorStep: "event", ...o }),
  /** clave: venueName */
  ceremonyVenue: (o = {}) =>
    f.text({ label: "Lugar de la ceremonia", placeholder: "Parroquia San José", required: true, max: 70, editorStep: "event", ...o }),
  /** clave: address */
  ceremonyAddress: (o = {}) =>
    f.text({ label: "Dirección de la ceremonia", placeholder: "Av. Reforma 123, Puebla", required: true, max: 140, editorStep: "event", ...o }),
  /** clave: reference */
  ceremonyReference: (o = {}) =>
    f.text({ label: "Referencia", placeholder: "Frente al jardín principal", max: 90, editorStep: "event", ...o }),
  /** clave: mapsUrl */
  ceremonyMapsUrl: (o = {}) =>
    link("Link de Google Maps (ceremonia)", { description: "Opcional. Si lo dejas vacío se busca la dirección.", placeholder: "https://maps.app.goo.gl/…", editorStep: "event", ...o }),

  // ── Recepción ─────────────────────────────────────────────────────────────
  /** clave: receptionTime */
  receptionTime: (o = {}) => time("Hora de la recepción", { editorStep: "event", ...o }),
  /** clave: receptionVenue */
  receptionVenue: (o = {}) =>
    f.text({ label: "Lugar de la recepción", placeholder: "Hacienda Los Olivos", max: 70, editorStep: "event", ...o }),
  /** clave: receptionAddress */
  receptionAddress: (o = {}) =>
    f.text({ label: "Dirección de la recepción", placeholder: "Camino Real km 4, Puebla", max: 140, editorStep: "event", ...o }),
  /** clave: receptionMapsUrl */
  receptionMapsUrl: (o = {}) =>
    link("Link de Google Maps (recepción)", { placeholder: "https://maps.app.goo.gl/…", editorStep: "event", ...o }),

  // ── Detalles ──────────────────────────────────────────────────────────────
  /** clave: dressCode */
  dressCode: (o = {}) =>
    f.select({
      label: "Código de vestimenta",
      options: [
        { value: "rigurosa", label: "Etiqueta rigurosa" },
        { value: "etiqueta", label: "Etiqueta" },
        { value: "formal", label: "Formal" },
        { value: "semiformal", label: "Semiformal" },
        { value: "coctel", label: "Cóctel" },
        { value: "playa", label: "Playa / casual elegante" },
      ],
      default: "formal",
      editorStep: "details",
      ...o,
    }),
  /** clave: dressCodeNote */
  dressCodeNote: (o = {}) =>
    f.textarea({ label: "Nota de vestimenta", placeholder: "Les pedimos reservar el color blanco para la novia.", max: 200, rows: 2, editorStep: "details", ...o }),
  /** clave: itinerary */
  itinerary: (o = {}) =>
    f.list({
      label: "Itinerario",
      itemLabel: "Momento",
      description: "Opcional. Ceremonia, cóctel, cena, baile…",
      max: 8,
      editorStep: "details",
      item: f.group({
        fields: {
          time: time("Hora"),
          title: f.text({ label: "Momento", placeholder: "Cóctel de bienvenida", max: 40 }),
          note: f.text({ label: "Detalle", placeholder: "En la terraza", max: 60 }),
        },
      }),
      ...o,
    }),
  /** clave: giftsNote */
  giftsNote: (o = {}) =>
    f.textarea({
      label: "Mesa de regalos",
      description: "Lluvia de sobres, mesa de regalos, link…",
      placeholder: "Tu presencia es nuestro mejor regalo. Si deseas obsequiarnos algo, agradecemos la lluvia de sobres.",
      max: 220,
      rows: 2,
      editorStep: "details",
      ...o,
    }),
  /** clave: giftsUrl */
  giftsUrl: (o = {}) => link("Link de la mesa de regalos", { placeholder: "https://…", editorStep: "details", ...o }),
  /** clave: notes */
  notes: (o = {}) =>
    f.textarea({ label: "Notas importantes", placeholder: "Evento sólo para adultos. Estacionamiento disponible.", max: 220, rows: 2, editorStep: "details", ...o }),

  // ── Confirmaciones ────────────────────────────────────────────────────────
  /** clave: rsvpEnabled */
  rsvpEnabled: (o = {}) =>
    f.toggle({ label: "Recibir confirmaciones de asistencia", default: true, editorStep: "rsvp", customerEditable: false, ...o }),
  /** clave: rsvpDeadline */
  rsvpDeadline: (o = {}) =>
    f.date({ label: "Confirmar hasta", portalLabel: "¿Hasta cuándo pueden confirmar? (opcional)", editorStep: "rsvp", ...o }),
  /** clave: hostPhone */
  hostPhone: (o = {}) =>
    f.text({ label: "WhatsApp de contacto", portalLabel: "WhatsApp para dudas y confirmaciones", placeholder: "+52 222 123 4567", max: 20, editorStep: "rsvp", ...o }),
  /** clave: rsvpNote */
  rsvpNote: (o = {}) =>
    f.text({ label: "Nota de confirmación", default: "Confírmanos tu asistencia, nos ayuda mucho a organizar el gran día.", max: 140, editorStep: "rsvp", ...o }),

  // ── Fotos, música y recuerdos ─────────────────────────────────────────────
  /** clave: photos */
  photos: (o = {}) =>
    f.images({ label: "Galería", portalLabel: "Sus fotos favoritas", description: "Opcional. Hasta 12 fotos.", max: 12, editorStep: "media", ...o }),
  /** clave: song */
  song: (o = {}) => f.audio({ label: "Canción de fondo", editorStep: "media", ...o }),
  /** clave: hashtag */
  hashtag: (o = {}) =>
    f.text({ label: "Hashtag", placeholder: "#ValentinaYSebastián", max: 40, editorStep: "media", ...o }),
  /** clave: photoShareUrl · link donde los invitados suben sus fotos (se muestra como QR) */
  photoShareUrl: (o = {}) =>
    link("Link para compartir fotos", { description: "Se muestra como código QR: los invitados suben ahí sus fotos.", placeholder: "https://photos.app.goo.gl/…", editorStep: "media", ...o }),
  /** clave: finalMessage */
  finalMessage: (o = {}) =>
    f.text({ label: "Mensaje final", default: "¡Te esperamos!", max: 70, editorStep: "media", ...o }),
};
