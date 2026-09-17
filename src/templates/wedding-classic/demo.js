import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["couple", "bouquet", "altar", "dance", "greenery", "rings"]);
const [cover, ...photos] = refs;

const wedding = new Date(Date.now() + 120 * 86400000);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "Ana y Luis Herrera",
    senderName: "Valentina & Sebastián",
    content: {
      brideName: "Valentina",
      groomName: "Sebastián",
      coverPhoto: cover,
      quote: "Juntos en un lugar hermoso para siempre",
      inviteMessage:
        "Después de tanto camino recorrido, llegó el día de decir «sí». Queremos celebrarlo contigo y con la gente que más queremos.",
      accent: "navy",
      passes: 2,
      guestNote: "¡Prepárense para bailar!",
      eventDate: iso(wedding),
      eventTime: "17:30",
      venueName: "Capilla del Carmen",
      address: "Calle 12 #45, Centro Histórico, Querétaro",
      reference: "A una cuadra del jardín Zenea",
      mapsUrl: "",
      receptionTime: "20:00",
      receptionVenue: "Quinta El Mirador",
      receptionAddress: "Camino a la Cañada 200, Querétaro",
      receptionMapsUrl: "",
      dressCode: "formal",
      dressCodeNote: "Ellas vestido largo o midi, ellos traje. El jardín es de pasto: tacón de plataforma es buena idea.",
      itinerary: [
        { time: "17:30", title: "Ceremonia", note: "Capilla del Carmen" },
        { time: "20:00", title: "Cóctel", note: "Terraza de la quinta" },
        { time: "21:00", title: "Cena", note: "Salón del jardín" },
        { time: "23:00", title: "Baile", note: "¡Hasta el final!" },
      ],
      giftsNote: "Contamos con mesa de regalos y también con lluvia de sobres. Lo importante es tenerte ahí.",
      giftsUrl: "",
      notes: "Habrá estacionamiento con valet en la quinta.",
      rsvpEnabled: true,
      rsvpDeadline: iso(new Date(wedding.getTime() - 30 * 86400000)),
      hostPhone: "+52 442 987 6543",
      rsvpNote: "Las mejores historias se comparten. Confírmanos si nos acompañas.",
      photos,
      song,
      hashtag: "#ValentinaYSebastián",
      finalMessage: "Gracias por ser parte de nuestra historia.",
    },
  },
  media,
};
