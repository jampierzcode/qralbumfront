import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "yellow-lantern",
  version: 1,
  name: "Lámpara de flores amarillas",
  description:
    "Una cúpula de cristal a oscuras que se enciende al tocarla: el girasol (o los tulipanes) de adentro brilla entre un hilo de luces y aparecen luciérnagas que cuidan tus recuerdos.",
  occasions: ["flores-amarillas", "amor", "amistad", "cumpleanos"],
  defaultCollections: ["flores", "amor", "amistad"],
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  // La cúpula apagada ES la pantalla de apertura: al tocarla se enciende y suena la música.
  gate: "template",
  theme: { background: "#0d0a14", foreground: "#fff3d6", accent: "#ffc83d" },
});
