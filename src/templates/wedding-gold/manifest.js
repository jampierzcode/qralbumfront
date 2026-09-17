import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "wedding-gold",
  version: 1,
  name: "Boda dorada",
  description:
    "Invitación elegante con marco dorado, mármol y eucalipto: foto de los novios, pase personal del invitado, cuenta regresiva y confirmación de asistencia.",
  occasions: ["boda", "invitacion", "aniversario"],
  defaultCollections: ["boda"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  // La portada con el sello dorado ES la pantalla de apertura.
  gate: "template",
  collectsResponses: ["rsvp"],
  theme: { background: "#f6f1e7", foreground: "#33302a", accent: "#b08d57" },
});
