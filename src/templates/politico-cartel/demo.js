import { demoMedia } from "../_demo-media/index.js";
import { politicianDemo } from "../_politician-kit/demo.js";

const base = politicianDemo({ primary: "#0b57d0", accent: "#ffb300" });
// Fondo de la portada: una foto que se multiplica con el azul del partido.
const { media: bgMedia, refs: [bgPhoto] } = demoMedia(["mountains"], { withSong: false });

export default {
  gift: {
    ...base.gift,
    content: {
      ...base.gift.content,
      bgPhoto,
      bgBlend: "multiply",
      bgOpacity: 65,
      bgSaturation: 110,
      bgContrast: 110,
      bgBrightness: 100,
      bgBlur: 0,
      bgPosition: "center",
    },
  },
  media: { ...base.media, ...bgMedia },
};
