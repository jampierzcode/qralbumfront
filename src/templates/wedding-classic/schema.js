import { defineSchema, f } from "../../../gift-core/index.js";
import { steps, w } from "../_wedding-kit/fields.js";

export default defineSchema({
  version: 1,
  steps: steps("couple", "guest", "event", "details", "rsvp", "media"),
  fields: {
    // Los novios
    brideName: w.bride(),
    groomName: w.groom(),
    coverPhoto: w.coverPhoto(),
    quote: w.quote({ default: "Juntos en un lugar hermoso para siempre" }),
    inviteMessage: w.inviteMessage(),
    accent: f.select({
      label: "Acento",
      options: [
        { value: "navy", label: "Dorado y azul" },
        { value: "olive", label: "Dorado y verde olivo" },
        { value: "wine", label: "Dorado y vino" },
      ],
      default: "navy",
      editorStep: "couple",
      customerEditable: false,
    }),

    // El invitado
    recipientName: w.guestName(),
    passes: w.passes(),
    guestNote: w.guestNote(),

    // Ceremonia y fiesta
    eventDate: w.weddingDate(),
    eventTime: w.ceremonyTime(),
    venueName: w.ceremonyVenue(),
    address: w.ceremonyAddress(),
    reference: w.ceremonyReference(),
    mapsUrl: w.ceremonyMapsUrl(),
    receptionTime: w.receptionTime(),
    receptionVenue: w.receptionVenue(),
    receptionAddress: w.receptionAddress(),
    receptionMapsUrl: w.receptionMapsUrl(),

    // Detalles
    dressCode: w.dressCode(),
    dressCodeNote: w.dressCodeNote(),
    itinerary: w.itinerary(),
    giftsNote: w.giftsNote(),
    giftsUrl: w.giftsUrl(),
    notes: w.notes(),

    // Confirmaciones
    rsvpEnabled: w.rsvpEnabled(),
    rsvpDeadline: w.rsvpDeadline(),
    hostPhone: w.hostPhone(),
    rsvpNote: w.rsvpNote({ default: "Las mejores historias se comparten. Confírmanos si nos acompañas." }),

    // Fotos y música
    photos: w.photos(),
    song: w.song(),
    hashtag: w.hashtag(),
    finalMessage: w.finalMessage({ default: "Gracias por ser parte de nuestra historia." }),
  },
});
