import { demoMedia } from "../_demo-media/index.js";

const { media, refs, song } = demoMedia(["couple", "rings", "bouquet", "greenery", "altar"]);
const [cover, ...photos] = refs;

// La boda es en 86 días para que el demo muestre la cuenta regresiva.
const wedding = new Date(Date.now() + 86 * 86400000);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default {
  gift: {
    recipientName: "Valeria Karla del Valle",
    senderName: "Victoria & Gabriel",
    content: {
      brideName: "Victoria",
      groomName: "Gabriel",
      coverPhoto: cover,
      quote: "Te esperamos con mucha ilusión en nuestra boda",
      inviteMessage:
        "Con la bendición de Dios y de nuestros padres, nos hace muy felices invitarte a celebrar el día en que unimos nuestras vidas.",
      palette: "gold",
      passes: 2,
      guestNote: "No podríamos imaginar este día sin ti.",
      eventDate: iso(wedding),
      eventTime: "17:00",
      venueName: "Parroquia de Santa María",
      address: "Av. 16 de Septiembre 3830, Cristóbal Colón, Puebla",
      reference: "Entrada por el atrio principal",
      mapsUrl: "",
      receptionTime: "19:30",
      receptionVenue: "Hacienda Los Olivos",
      receptionAddress: "Camino Real km 4, Puebla",
      receptionMapsUrl: "",
      dressCode: "etiqueta",
      dressCodeNote: "Les pedimos reservar el color blanco para la novia.",
      itinerary: [
        { time: "17:00", title: "Ceremonia religiosa", note: "Parroquia de Santa María" },
        { time: "19:30", title: "Cóctel de bienvenida", note: "Jardín de la hacienda" },
        { time: "21:00", title: "Cena y brindis", note: "Salón principal" },
        { time: "22:30", title: "Primer baile", note: "¡Y a bailar toda la noche!" },
      ],
      giftsNote: "Tu presencia es nuestro mejor regalo. Si deseas obsequiarnos algo, agradecemos la lluvia de sobres.",
      rsvpEnabled: true,
      rsvpDeadline: iso(new Date(wedding.getTime() - 21 * 86400000)),
      hostPhone: "+52 222 123 4567",
      rsvpNote: "Confírmanos tu asistencia, nos ayuda mucho a organizar el gran día.",
      photos,
      song,
      finalMessage: "Gracias por acompañarnos en el día más feliz de nuestra vida.",
    },
  },
  media,
};
