import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["kid", "balloons", "party", "gift", "cake"]);
const [cover, ...photos] = refs;

// La fiesta es en 12 días para que el demo muestre la cuenta regresiva.
const party = new Date(Date.now() + 12 * 86400000);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "Mateo",
    senderName: "Familia Pérez",
    content: {
      age: 6,
      coverPhoto: cover,
      theme: "heroes",
      greeting: "",
      inviteMessage: "Te invito a celebrar mi súper cumpleaños",
      missionText: "Será una misión muy especial y quiero que estés ahí.",
      eventDate: iso(party),
      eventTime: "16:00",
      venueName: "Salón Aventuras",
      address: "Calle Diversión 123, Miraflores, Lima",
      reference: "Frente al parque Kennedy",
      mapsUrl: "",
      rsvpEnabled: true,
      rsvpDeadline: iso(new Date(party.getTime() - 3 * 86400000)),
      hostPhone: "+51 987 654 321",
      photos,
      song,
      finalMessage: "¡Nos vemos pronto para vivir esta aventura!",
    },
  },
  media,
};
