import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["blossoms", "balloons", "gift", "cake", "bouquet"]);
const [cover, ...photos] = refs;

// El baby shower es en 18 días para que el demo muestre la cuenta regresiva.
const shower = new Date(Date.now() + 18 * 86400000);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "Emilia",
    senderName: "Ana y Luis",
    content: {
      gender: "girl",
      dueDate: iso(new Date(shower.getTime() + 55 * 86400000)),
      coverPhoto: cover,
      greeting: "",
      announceMessage: "Nuestro corazón está por crecer y queremos celebrarlo contigo.",
      inviteMessage: "Te esperamos en el baby shower para darle la bienvenida con mucho amor.",
      eventDate: iso(shower),
      eventTime: "16:00",
      venueName: "Casa de la abuela Rosa",
      address: "Av. Los Nogales 145, Surco, Lima",
      reference: "Portón blanco, frente al parque",
      mapsUrl: "",
      dressCode: "Ven de rosa pastel",
      giftIdeas: ["Pañales talla 1", "Biberones", "Mantitas de algodón", "Body 0-3 meses", "Toallitas húmedas"],
      registryUrl: "",
      registryNote: "Tu presencia es el mejor regalo, pero si quieres consentir a Emilia…",
      rsvpEnabled: true,
      rsvpDeadline: iso(new Date(shower.getTime() - 4 * 86400000)),
      hostPhone: "+51 987 654 321",
      photos,
      song,
      finalMessage: "Gracias por acompañarnos en la espera más linda de nuestra vida.",
    },
  },
  media,
};
