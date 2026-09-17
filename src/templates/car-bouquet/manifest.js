import { defineManifest } from "../../../gift-core/index.js";

export default defineManifest({
  id: "car-bouquet",
  version: 1,
  name: "Ramo de carritos",
  description:
    "Un ramo de carritos de colección que se arma en pantalla: cada carrito guarda un mensaje y detrás vienen la carta, el álbum de fotos y los videos.",
  occasions: ["cumpleanos", "amor", "aniversario", "amistad", "infantil"],
  defaultCollections: ["cumpleanos", "amor"],
  // Lo que cobra un referido por cada regalo de esta plantilla (S/). Sólo se
  // usa al registrarla por primera vez: después manda lo que pongas en el admin.
  referralPrice: 15,
  tier: "css",
  supportsMusic: true,
  soundtrack: "song",
  // La portada oscura con "TOCA PARA ABRIR" ES la pantalla de apertura.
  gate: "template",
  theme: { background: "#070b1a", foreground: "#eaf2ff", accent: "#35c8ff" },
});
