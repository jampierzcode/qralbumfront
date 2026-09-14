import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "love-letter",
  version: 1,
  name: "Carta de amor",
  description: "Un sobre sellado que se abre para dejar salir una carta escrita a mano, sus recuerdos y una canción.",
  occasions: ["amor", "aniversario", "san-valentin", "perdon", "amistad"],
  defaultCollections: ["amor", "aniversario"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  // El sobre ES la pantalla de apertura: la plantilla llama a open() cuando lo tocan.
  gate: "template",
  theme: { background: "#0f0b0e", foreground: "#f4ebdf", accent: "#c8a27a" },
});
