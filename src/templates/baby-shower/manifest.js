import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "baby-shower",
  version: 1,
  name: "Baby shower (invitación)",
  description: "Invitación mágica de baby shower: azul si es niño, rosado si es niña. Anuncio, detalles, mesa de regalos, cuenta regresiva y confirmación de asistencia.",
  occasions: ["baby-shower", "bebe", "invitacion", "infantil"],
  defaultCollections: ["baby-shower"],
  referralPrice: 15,
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  gate: "template",
  // Los invitados confirman asistencia desde la invitación.
  collectsResponses: ["rsvp"],
  theme: { background: "#e8f1ff", foreground: "#2f3d6b", accent: "#7fb2ea" },
});
