import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["coffee", "city-lights", "beach", "mountains", "stars"]);

export default {
  gift: {
    recipientName: "Sofía",
    senderName: "Mateo",
    content: {
      teaser: "Tengo algo para ti",
      letter:
        "Hay cosas que no sé decir en voz alta, así que decidí escribirlas.\n\nDesde aquel café que se enfrió mientras hablábamos, mi vida tiene otro ritmo. Me enseñaste que los domingos pueden ser eternos, que perderse en una ciudad nueva es mejor contigo y que el mar suena distinto cuando me tomas de la mano.\n\nGracias por quedarte en los días difíciles y por reírte de mis chistes malos. No sé qué nos traerá el futuro, pero sé con quién quiero descubrirlo.",
      closing: "Con todo mi amor",
      letterDate: "2026-02-14",
      memories: refs,
      song,
      finalMessage: "Eres mi lugar favorito.",
      sealColor: "wine",
    },
  },
  media,
};
