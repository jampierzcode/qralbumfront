import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["couple", "navy-blooms", "rings", "dance", "altar"]);
const [cover, ...photos] = refs;

// La boda es en 57 días: el demo muestra la cuenta regresiva en marcha.
const wedding = new Date(Date.now() + 57 * 86400000);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "Familia Quiñones",
    senderName: "Camila & Rodrigo",
    content: {
      brideName: "Camila",
      groomName: "Rodrigo",
      coverPhoto: cover,
      quote: "Toca y descubre cada detalle",
      inviteMessage:
        "Hay días que se sueñan mucho antes de vivirlos. Este es uno de ellos y no queremos vivirlo sin ti.",
      sealColor: "gold",
      passes: 2,
      guestNote: "Guardamos un lugar especial para ustedes.",
      eventDate: iso(wedding),
      eventTime: "18:00",
      venueName: "Iglesia San Cayetano",
      address: "Cnel. Suárez 715, Quilmes",
      reference: "Estacionamiento sobre la calle lateral",
      mapsUrl: "",
      receptionTime: "20:30",
      receptionVenue: "Club Cañuelas",
      receptionAddress: "Lavalleja 940, Quilmes",
      receptionMapsUrl: "",
      dressCode: "etiqueta",
      dressCodeNote: "Ellas de largo, ellos de traje oscuro. Les pedimos evitar el blanco y el azul noche.",
      itinerary: [
        { time: "18:00", title: "Ceremonia", note: "Iglesia San Cayetano" },
        { time: "20:30", title: "Recepción", note: "Club Cañuelas" },
        { time: "21:30", title: "Cena", note: "Salón principal" },
        { time: "23:00", title: "Fiesta", note: "Hasta que salga el sol" },
      ],
      notes: "Evento sólo para adultos. Habrá servicio de traslado desde la iglesia.",
      giftsNote: "Tu compañía es el mejor regalo. Si quieres obsequiarnos algo, hicimos una lista con mucho cariño.",
      giftsUrl: "",
      rsvpEnabled: true,
      rsvpDeadline: iso(new Date(wedding.getTime() - 20 * 86400000)),
      hostPhone: "+54 11 5555 4444",
      rsvpNote: "Necesitamos tu confirmación para reservar tu lugar en la mesa.",
      photos,
      song,
      finalMessage: "Nos vemos en la pista de baile.",
    },
  },
  media,
};
