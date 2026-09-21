import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["sunflowers", "sunset", "coffee", "stars", "beach", "blossoms"]);

export default {
  gift: {
    recipientName: "Andrea",
    senderName: "Diego",
    content: {
      title: "Una luz amarilla para ti",
      message:
        "Dicen que las flores amarillas se regalan para compartir alegría. Yo te regalo esta luz para agradecerte por llenar mis días de calor, por las risas, los cafés largos y cada atardecer que vimos juntos.",
      importantDate: "2023-09-21",
      photos: refs,
      song,
      videos: [],
      flower: "sunflower",
      glow: "gold",
      fireflies: true,
    },
  },
  media,
};
