// Contenido de ejemplo compartido por los diseños de político (catálogo, "Ver demo", tests).
// Candidato, partido y equipo son INVENTADOS: ilustraciones propias, sin personas reales.
import { demoMedia } from "../_demo-media/index.js";
import { politicianMedia } from "./media/index.js";

const DAY = 86400000;
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inDays = (n) => iso(new Date(Date.now() + n * DAY));

/**
 * Demo completo (pasa la validación de publicación).
 * @param {{ primary?: string, accent?: string }} [colors] colores del partido del ejemplo
 */
export function politicianDemo({ primary = "#0b57d0", accent = "#ffb300" } = {}) {
  const { media: illus, refs: r } = politicianMedia(["candidate", "party-logo", "team-1", "team-2", "team-3", "team-4"]);
  const { media: photos, refs: covers } = demoMedia(["city-lights", "party", "dance", "stars"], { withSong: false });
  const [caminata, cierre, taller, foro] = covers;

  return {
    gift: {
      recipientName: "Rodrigo Salas Quispe",
      content: {
        photo: r.candidate,
        office: "Alcalde",
        place: "Distrito de San Isidro, Lima",
        slogan: "Juntos por un San Isidro seguro y ordenado",
        bio: "Vecino de San Isidro, ingeniero civil y padre de dos hijos. Lleva quince años trabajando con las juntas vecinales por parques más seguros y calles en buen estado.",
        partyName: "Movimiento Ciudadano Renovación",
        partyLogo: r["party-logo"],
        colorPrimary: primary,
        colorAccent: accent,
        voteDate: inDays(30),
        voteTime: "07:00",
        team: [
          { photo: r["team-1"], name: "Lucía Paredes", role: "Candidata a regidora" },
          { photo: r["team-2"], name: "Marco Villanueva", role: "Candidato a regidor" },
          { photo: r["team-3"], name: "Andrea Cáceres", role: "Coordinadora de campaña" },
          { photo: r["team-4"], name: "Jorge Huamán", role: "Vocero vecinal" },
        ],
        proposals: [
          { icon: "security", title: "Parques y calles seguros", description: "Más serenazgo y cámaras conectadas a cada junta vecinal." },
          { icon: "works", title: "Pistas y veredas en buen estado", description: "Un plan de obras con cronograma público, cuadra por cuadra." },
          { icon: "environment", title: "Más áreas verdes", description: "Un árbol nuevo por cada familia del distrito." },
          { icon: "education", title: "Talleres para jóvenes", description: "Deporte, tecnología y arte gratis después del colegio." },
          { icon: "transparency", title: "Cuentas claras", description: "Cada gasto de la municipalidad publicado cada mes." },
        ],
        links: [
          { network: "facebook", label: "Fanpage", url: "https://www.facebook.com" },
          { network: "instagram", label: "Instagram", url: "https://www.instagram.com" },
          { network: "tiktok", label: "TikTok", url: "https://www.tiktok.com" },
          { network: "youtube", label: "Canal de YouTube", url: "https://www.youtube.com" },
          { network: "whatsapp-group", label: "Grupo de vecinos", url: "https://chat.whatsapp.com/GrupoDemoRenovacion" },
          { network: "whatsapp", label: "Escríbenos por WhatsApp", url: "+51 987 654 321" },
          { network: "web", label: "Plan de gobierno", url: "https://example.com/plan" },
        ],
        campaign: {
          kind: "upcoming",
          title: "Gran caminata por San Isidro",
          description: "Recorreremos juntos el distrito y escucharemos a cada vecino. ¡Trae a tu familia!",
          date: inDays(9),
          time: "16:00",
          place: "Parque El Olivar",
          cover: caminata,
          streamUrl: "https://www.facebook.com",
        },
        history: [
          {
            kind: "past",
            title: "Gran cierre de campaña",
            description: "Más de tres mil vecinos en la plaza principal.",
            date: inDays(-20),
            place: "Plaza Mayor",
            cover: cierre,
            streamUrl: "https://www.youtube.com",
          },
          { kind: "past", title: "Taller con jóvenes emprendedores", date: inDays(-45), place: "Centro cívico", cover: taller },
          { kind: "past", title: "Foro vecinal de seguridad", description: "Se recogieron 120 propuestas de las juntas vecinales.", date: inDays(-80), cover: foro },
        ],
      },
    },
    media: { ...illus, ...photos },
  };
}
