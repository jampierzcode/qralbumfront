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
    quote: w.quote({ label: "Frase del save the date", default: "Muy pronto celebraremos nuestra boda" }),
    inviteMessage: w.inviteMessage({
      default: "Nos hace muy felices invitarte a celebrar nuestra boda.",
    }),
    saveTheDate: f.toggle({
      label: "Mostrar el «Save the date»",
      description: "La tarjeta con el arco de eucalipto antes de los detalles.",
      default: true,
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
    dressCode: w.dressCode({ default: "semiformal" }),
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
    photoShareUrl: w.photoShareUrl(),
    hashtag: w.hashtag(),
    finalMessage: w.finalMessage({ default: "¡Gracias por acompañarnos!" }),
  },
});
