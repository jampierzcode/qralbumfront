import { defineSchema, f } from "../../../gift-core/index.js";

// Mismos datos que "Flores amarillas" (un regalo se puede pasar de una plantilla a la otra) más dos
// ajustes: la flor (el cliente elige girasol o tulipanes), el color de la luz y las luciérnagas (admin).
export default defineSchema({
  version: 1,
  steps: [
    { id: "who", title: "Para quién es", portalTitle: "¿Para quién es la sorpresa?" },
    { id: "message", title: "Mensaje", portalTitle: "Escribe tu mensaje" },
    { id: "photos", title: "Fotos", portalTitle: "Sube sus fotos favoritas" },
    { id: "music", title: "Música", portalTitle: "Elige su canción" },
    { id: "extras", title: "Extras" },
  ],
  fields: {
    recipientName: f.text({
      label: "Nombre de quien recibe",
      portalLabel: "¿Cómo se llama?",
      placeholder: "Andrea",
      required: true,
      max: 40,
      editorStep: "who",
    }),
    senderName: f.text({
      label: "De parte de",
      portalLabel: "¿Quién lo envía?",
      placeholder: "Diego",
      max: 40,
      editorStep: "who",
    }),
    title: f.text({
      label: "Título",
      description: "Aparece cuando se enciende la lámpara.",
      placeholder: "Una luz amarilla para ti",
      default: "Una luz amarilla para ti",
      max: 60,
      editorStep: "message",
      customerEditable: false,
    }),
    message: f.textarea({
      label: "Mensaje",
      portalLabel: "Tu mensaje",
      description: "Escríbelo como si se lo dijeras en persona.",
      placeholder: "Porque contigo hasta la noche se ilumina…",
      required: true,
      min: 10,
      max: 600,
      rows: 5,
      editorStep: "message",
    }),
    importantDate: f.date({
      label: "Fecha especial",
      portalLabel: "¿Una fecha importante?",
      description: "El día que se conocieron, su aniversario…",
      editorStep: "message",
    }),
    photos: f.images({
      label: "Fotos",
      portalLabel: "Tus fotos",
      description: "Cuelgan de la luz como recuerdos.",
      required: true,
      min: 1,
      max: 12,
      editorStep: "photos",
    }),
    song: f.audio({
      label: "Canción",
      portalLabel: "Canción",
      description: "Suena cuando se enciende la lámpara.",
      editorStep: "music",
    }),
    videos: f.list({
      label: "Videos",
      description: "Opcional. Se muestran al final.",
      itemLabel: "Video",
      max: 4,
      item: f.video({ label: "Video" }),
      editorStep: "extras",
      customerEditable: false,
    }),
    flower: f.select({
      label: "Flor de la lámpara",
      portalLabel: "¿Qué flor quieres en la lámpara?",
      options: [
        { value: "sunflower", label: "Girasol" },
        { value: "tulips", label: "Tulipanes" },
      ],
      default: "sunflower",
      editorStep: "who",
    }),
    glow: f.select({
      label: "Color de la luz",
      options: [
        { value: "gold", label: "Dorado" },
        { value: "amber", label: "Ámbar" },
        { value: "honey", label: "Miel" },
      ],
      default: "gold",
      editorStep: "extras",
      customerEditable: false,
    }),
    fireflies: f.toggle({
      label: "Luciérnagas",
      description: "Puntos de luz que flotan alrededor. Se desactivan solos en equipos lentos.",
      default: true,
      editorStep: "extras",
      customerEditable: false,
    }),
  },
});
