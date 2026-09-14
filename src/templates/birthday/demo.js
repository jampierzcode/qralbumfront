import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["cake", "party", "balloons", "beach", "city-lights", "sunset", "coffee"]);
const [cover, ...photos] = refs;

// Un cumpleaños que llega en 12 días, para que el demo muestre la cuenta regresiva.
const next = new Date(Date.now() + 12 * 86400000);
const birthDate = `1998-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "Sofía",
    senderName: "Tus amigas",
    content: {
      birthDate,
      coverPhoto: cover,
      coverVideo: null,
      greeting: "¡Feliz cumpleaños",
      introTitle: "Hoy celebramos tu vida",
      message: "Gracias por ser esa persona tan increíble, por tu luz, tu risa y por hacer de este mundo un lugar más bonito.",
      photoCaption: "Siempre tú",
      photos,
      song,
      songTitle: "Caja de música",
      songArtist: "Para Sofía",
      noteMessage: "Que este nuevo año te traiga todo lo bonito que mereces.",
      noteSignature: "Te queremos",
      friendMessages: [
        { name: "Valeria", message: "¡Feliz cumple, amiga! Gracias por las risas infinitas. Te quiero montones." },
        { name: "Camila", message: "Que este año esté lleno de viajes, música y todo lo que sueñas." },
        { name: "Mamá", message: "Mi niña hermosa, estoy orgullosa de la mujer que eres. Feliz día." },
      ],
      style: "classic",
    },
  },
  media,
};
