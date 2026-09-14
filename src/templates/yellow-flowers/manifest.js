import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "yellow-flowers",
  version: 1,
  name: "Flores amarillas",
  description: "Un jardín de girasoles florece en la pantalla y guarda sus recuerdos entre pétalos.",
  occasions: ["flores-amarillas", "amor", "amistad", "cumpleanos"],
  defaultCollections: ["flores", "amor", "amistad"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  gate: "shell",
  gateCopy: {
    eyebrow: "Tienes un regalo",
    title: "Flores para {recipientName}",
    fallbackTitle: "Flores para ti",
    button: "Toca para abrir",
  },
  theme: { background: "#120c03", foreground: "#fff3d6", accent: "#ffc83d" },
});
