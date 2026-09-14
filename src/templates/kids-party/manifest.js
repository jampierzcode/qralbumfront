import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "kids-party",
  version: 1,
  name: "Súper cumpleaños (invitación)",
  description: "Invitación infantil temática: detalles del evento, mapa, cuenta regresiva y confirmación de asistencia de los invitados.",
  occasions: ["cumpleanos", "infantil", "invitacion"],
  defaultCollections: ["cumpleanos"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  gate: "template",
  // Los invitados confirman asistencia desde la invitación.
  collectsResponses: ["rsvp"],
  theme: { background: "#1c4fb8", foreground: "#ffffff", accent: "#ffd23f" },
});
