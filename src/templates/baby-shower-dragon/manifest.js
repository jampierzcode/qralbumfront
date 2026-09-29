import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "baby-shower-dragon",
  version: 1,
  name: "Baby shower · Esferas del dragón",
  description: "Invitación de baby shower de aventura: las 7 esferas se encienden, el dragón aparece y se cumple el deseo. Anuncio, detalles, mesa de regalos, cuenta regresiva y confirmación de asistencia.",
  occasions: ["baby-shower", "bebe", "invitacion", "infantil", "anime"],
  defaultCollections: ["baby-shower"],
  referralPrice: 15,
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  gate: "template",
  // Los invitados confirman asistencia desde la invitación.
  collectsResponses: ["rsvp"],
  theme: { background: "#ffb37a", foreground: "#6b2a4f", accent: "#e8508a" },
});
