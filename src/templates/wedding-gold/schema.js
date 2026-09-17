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
    quote: w.quote({ default: "Te esperamos con mucha ilusión en nuestra boda" }),
    inviteMessage: w.inviteMessage(),
    palette: f.select({
      label: "Paleta",
      options: [
        { value: "gold", label: "Dorado clásico" },
        { value: "rose", label: "Oro rosa" },
        { value: "emerald", label: "Verde esmeralda" },
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
    dressCode: w.dressCode(),
    dressCodeNote: w.dressCodeNote(),
    itinerary: w.itinerary(),
    giftsNote: w.giftsNote(),

    // Confirmaciones
    rsvpEnabled: w.rsvpEnabled(),
    rsvpDeadline: w.rsvpDeadline(),
    hostPhone: w.hostPhone(),
    rsvpNote: w.rsvpNote(),

    // Fotos y música
    photos: w.photos(),
    song: w.song(),
    finalMessage: w.finalMessage({ default: "Gracias por acompañarnos en el día más feliz de nuestra vida." }),
  },
});
