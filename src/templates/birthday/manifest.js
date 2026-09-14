import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "birthday",
  version: 1,
  name: "Feliz cumpleaños",
  description: "Su foto de portada, un mensaje, los momentos que la hacen única, su canción y un gran final con globos y confeti.",
  occasions: ["cumpleanos", "amistad", "amor"],
  defaultCollections: ["cumpleanos", "amistad"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  // La portada con el botón de play es la pantalla de apertura.
  gate: "template",
  theme: { background: "#0d0b10", foreground: "#fff6ee", accent: "#f2b8c6" },
});
