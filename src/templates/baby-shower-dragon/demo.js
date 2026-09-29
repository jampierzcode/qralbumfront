import { demoMedia } from "../_demo-media/index.js";
import { demoBaby, demoQr } from "../baby-shower/media/index.js";

const { media: photoMedia, refs: photos, song } = demoMedia(["kid", "balloons", "party", "gift"]);
// Portada del demo: la ilustración de la bebé en rosado (el demo es "girl").
const { media: babyMedia, ref: cover } = demoBaby("baby-girl");

const { media: yapeMedia, ref: yapeQr } = demoQr("qr-yape");
const { media: plinMedia, ref: plinQr } = demoQr("qr-plin");

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
      announceMessage: "Reunimos las 7 esferas del dragón y se cumplió nuestro deseo: ¡un bebé viene en camino!",
      inviteMessage: "Ven a su baby shower a cargar energía y darle la bienvenida con mucho amor.",
      eventDate: iso(shower),
      eventTime: "16:00",
      venueName: "Casa de la abuela Rosa",
      address: "Av. Los Nogales 145, Surco, Lima",
      reference: "Portón blanco, frente al parque",
      mapsUrl: "",
      dressCode: "Ven de naranja o disfrazado de guerrero",
      giftIdeas: ["Pañales talla 1", "Biberones", "Mantitas de algodón", "Body 0-3 meses", "Toallitas húmedas"],
      payMethods: [
        { title: "Yape", qr: yapeQr, detail: "987 654 321 · Ana Pérez" },
        { title: "Plin", qr: plinQr, detail: "987 654 321 · Ana Pérez" },
      ],
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
  media: { ...babyMedia, ...yapeMedia, ...plinMedia, ...photoMedia },
};
