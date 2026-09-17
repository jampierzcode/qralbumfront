import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "wedding-navy",
  version: 1,
  name: "Boda azul noche",
  description:
    "Invitación interactiva en azul marino con acuarelas y sello de cera: se abre al tocar el sello y cada detalle aparece en su propia tarjeta.",
  occasions: ["boda", "invitacion"],
  defaultCollections: ["boda"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  // El sobre con el sello de cera ES la pantalla de apertura.
  gate: "template",
  collectsResponses: ["rsvp"],
  theme: { background: "#132445", foreground: "#eef3fb", accent: "#c7a86a" },
});
