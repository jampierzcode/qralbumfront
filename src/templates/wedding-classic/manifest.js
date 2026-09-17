import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "wedding-classic",
  version: 1,
  name: "Boda clásica (menú)",
  description:
    "Portada con la foto de los novios y un menú de accesos: ceremonia, ubicación, galería y confirmación se abren en su propia pantalla, como una app.",
  occasions: ["boda", "invitacion"],
  defaultCollections: ["boda"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  gate: "template",
  collectsResponses: ["rsvp"],
  theme: { background: "#f7f2e8", foreground: "#2c2a25", accent: "#1f3a63" },
});
