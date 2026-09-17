import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "wedding-greenery",
  version: 1,
  name: "Boda eucalipto",
  description:
    "Save the date y invitación en verde eucalipto: monograma de los novios, pase con el número de accesos y código QR para que los invitados compartan sus fotos.",
  occasions: ["boda", "invitacion", "save-the-date"],
  defaultCollections: ["boda", "save-the-date"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  gate: "template",
  collectsResponses: ["rsvp"],
  theme: { background: "#2f4534", foreground: "#f3f1e7", accent: "#c9b98a" },
});
