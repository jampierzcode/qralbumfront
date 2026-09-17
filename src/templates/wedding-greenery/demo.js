import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["couple", "greenery", "altar", "bouquet", "dance"]);
const [cover, ...photos] = refs;

const wedding = new Date(Date.now() + 200 * 86400000);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "María Fernanda",
    senderName: "Jocelyn & Juan",
    content: {
      brideName: "Jocelyn",
      groomName: "Juan",
      coverPhoto: cover,
      quote: "Muy pronto celebraremos nuestra boda",
      inviteMessage: "Nos hace muy felices invitarte a celebrar nuestra boda.",
      saveTheDate: true,
      passes: 2,
      guestNote: "Gracias por caminar con nosotros desde el principio.",
      eventDate: iso(wedding),
      eventTime: "16:00",
      venueName: "Jardín Los Encinos",
      address: "Camino al Bosque 145, Valle de Bravo",
      reference: "Portón de madera, a la derecha del vivero",
      mapsUrl: "",
      receptionTime: "18:30",
      receptionVenue: "Terraza Los Encinos",
      receptionAddress: "Camino al Bosque 145, Valle de Bravo",
      receptionMapsUrl: "",
      dressCode: "semiformal",
      dressCodeNote: "Es un jardín: les recomendamos zapato cómodo y un abrigo ligero para la noche.",
      itinerary: [
        { time: "16:00", title: "Ceremonia", note: "En el jardín" },
        { time: "17:30", title: "Sesión de fotos", note: "Con todos los invitados" },
        { time: "18:30", title: "Cena", note: "En la terraza" },
        { time: "21:00", title: "Fiesta", note: "Con música en vivo" },
      ],
      giftsNote: "Tu presencia es lo más importante. Si deseas regalarnos algo, agradecemos la lluvia de sobres.",
      rsvpEnabled: true,
      rsvpDeadline: iso(new Date(wedding.getTime() - 45 * 86400000)),
      hostPhone: "+52 55 1234 5678",
      rsvpNote: "Confírmanos antes de la fecha límite para apartar tus lugares.",
      photos,
      song,
      photoShareUrl: "https://photos.app.goo.gl/ejemplo-boda",
      hashtag: "#JocelynYJuan",
      finalMessage: "¡Gracias por acompañarnos!",
    },
  },
  media,
};
