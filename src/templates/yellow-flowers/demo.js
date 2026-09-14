import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["sunflowers", "sunset", "coffee", "stars", "beach", "blossoms"]);

export default {
  gift: {
    recipientName: "Andrea",
    senderName: "Diego",
    content: {
      title: "Flores amarillas para ti",
      message:
        "Dicen que las flores amarillas se regalan para compartir alegría. Yo te regalo estas para agradecerte por llenar mis días de luz, por las risas, los cafés largos y cada atardecer que vimos juntos.",
      importantDate: "2023-09-21",
      photos: refs,
      song,
      videos: [],
    },
  },
  media,
};
