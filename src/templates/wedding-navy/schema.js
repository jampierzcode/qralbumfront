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
    quote: w.quote({ default: "Toca y descubre cada detalle" }),
    inviteMessage: w.inviteMessage(),
    sealColor: f.select({
      label: "Color del sello de cera",
      options: [
        { value: "gold", label: "Dorado" },
        { value: "navy", label: "Azul marino" },
        { value: "burgundy", label: "Vino" },
      ],
      default: "gold",
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
    dressCode: w.dressCode({ default: "etiqueta" }),
    dressCodeNote: w.dressCodeNote(),
    itinerary: w.itinerary(),
    notes: w.notes(),
    giftsNote: w.giftsNote(),
    giftsUrl: w.giftsUrl(),

    // Confirmaciones
    rsvpEnabled: w.rsvpEnabled(),
    rsvpDeadline: w.rsvpDeadline(),
    hostPhone: w.hostPhone(),
    rsvpNote: w.rsvpNote(),

    // Fotos y música
    photos: w.photos(),
    song: w.song(),
    finalMessage: w.finalMessage({ default: "Nos vemos en la pista de baile." }),
  },
});
