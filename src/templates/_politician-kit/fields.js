// Campos comunes de TODA tarjeta de político.
// ESM puro y sin dependencias: lo importan los schema.js de cada diseño y, desde ahí,
// también el backend (validación) y el portal del comprador.
//
// Un diseño nuevo NO inventa campos: usa politicianSchema() y así el cliente siempre
// llena la misma información, sin importar el diseño que compre.
//
// Quién edita qué:
//  · El cliente llena candidato, partido, día de votación, equipo, propuestas, links
//    y UNA campaña (`campaign`).
//  · Sólo el superadmin ve y edita `history` (customerEditable: false): las campañas
//    adicionales que se agregan y cobran aparte.
import { defineManifest, defineSchema, f } from "../../../gift-core/index.js";
import { NETWORKS, checkLink } from "./networks.js";

const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;
const LINK = /^https:\/\/\S+$/i;

const time = (label, extra = {}) =>
  f.text({
    label,
    description: "Formato 24 horas, ej. 08:00",
    placeholder: "08:00",
    max: 5,
    validate: (v) => (v && !TIME.test(v) ? "La hora debe tener formato 24 h, por ejemplo 08:00." : undefined),
    ...extra,
  });

const link = (label, extra = {}) =>
  f.text({
    label,
    max: 300,
    validate: (v) => (v && !LINK.test(v) ? "Pega un link que empiece con https://" : undefined),
    ...extra,
  });

export const POLITICIAN_STEPS = Object.freeze({
  candidate: { id: "candidate", title: "Candidato", portalTitle: "¿Quién es el candidato?" },
  party: { id: "party", title: "Partido y número", portalTitle: "Partido y número de votación" },
  vote: { id: "vote", title: "Día de votación", portalTitle: "¿Cuándo se vota?" },
  team: { id: "team", title: "Equipo de trabajo", portalTitle: "Su equipo de trabajo" },
  proposals: { id: "proposals", title: "Propuestas", portalTitle: "Sus propuestas" },
  links: { id: "links", title: "Redes y links", portalTitle: "Redes sociales y links" },
  campaign: { id: "campaign", title: "Campaña", portalTitle: "Tu última campaña o próxima invitación" },
  history: { id: "history", title: "Historial de campañas", description: "Sólo tú (superadmin) puedes agregarlas." },
});

/** steps("candidate", "party", …) → los pasos en el orden pedido. */
export function steps(...ids) {
  return ids.map((id) => {
    const step = POLITICIAN_STEPS[id];
    if (!step) throw new Error(`Paso de político desconocido: "${id}".`);
    return step;
  });
}

/** Íconos que se pueden elegir para una propuesta (value → etiqueta). */
export const PROPOSAL_ICONS = Object.freeze([
  { value: "star", label: "Estrella" },
  { value: "education", label: "Educación" },
  { value: "health", label: "Salud" },
  { value: "security", label: "Seguridad" },
  { value: "works", label: "Obras y pistas" },
  { value: "jobs", label: "Empleo" },
  { value: "water", label: "Agua" },
  { value: "environment", label: "Medio ambiente" },
  { value: "culture", label: "Cultura" },
  { value: "sports", label: "Deporte" },
  { value: "transparency", label: "Transparencia" },
  { value: "transport", label: "Transporte" },
  { value: "family", label: "Familia y comunidad" },
]);

export const CAMPAIGN_KINDS = Object.freeze([
  { value: "upcoming", label: "Próxima (invitación)" },
  { value: "past", label: "Ya realizada" },
]);

/** Una campaña. Todo es opcional: se muestra lo que tenga. `kind` es el tipo con el que nace cada una. */
const campaignGroup = ({ kind = "upcoming", ...o } = {}) =>
  f.group({
    fields: {
      kind: f.select({ label: "Tipo", options: CAMPAIGN_KINDS, default: kind }),
      title: f.text({ label: "Título", placeholder: "Gran caminata por San Isidro", max: 80 }),
      description: f.textarea({ label: "Descripción", description: "Qué se hará o qué se logró.", max: 400, rows: 3 }),
      date: f.date({ label: "Fecha" }),
      time: time("Hora"),
      place: f.text({ label: "Lugar", placeholder: "Parque El Olivar", max: 90 }),
      cover: f.image({ label: "Portada", description: "Horizontal se ve mejor." }),
      streamUrl: link("Link de transmisión o video", { description: "Facebook Live, YouTube, TikTok Live…", placeholder: "https://…" }),
    },
    ...o,
  });

/**
 * Campos de político. Cada uno acepta overrides: p.slogan({ required: true }).
 * Las claves recomendadas están en el comentario de cada campo.
 */
export const p = {
  // ── Candidato ─────────────────────────────────────────────────────────────
  /** clave: recipientName (columna del regalo) */
  name: (o = {}) =>
    f.text({ label: "Nombre del candidato", portalLabel: "¿Cómo se llama el candidato?", placeholder: "Rodrigo Salas", required: true, max: 60, editorStep: "candidate", ...o }),
  /** clave: photo */
  photo: (o = {}) =>
    f.image({
      label: "Foto del candidato",
      portalLabel: "Su mejor foto",
      description: "De medio cuerpo. Con el fondo recortado (PNG o WEBP con transparencia) se ve mucho mejor.",
      required: true,
      editorStep: "candidate",
      ...o,
    }),
  /** clave: office · cargo al que postula */
  office: (o = {}) =>
    f.text({ label: "Cargo al que postula", portalLabel: "¿A qué cargo postula?", placeholder: "Alcalde", required: true, max: 40, editorStep: "candidate", ...o }),
  /** clave: place · región, distrito o lugar */
  place: (o = {}) =>
    f.text({ label: "Lugar donde postula", portalLabel: "¿En qué lugar postula?", placeholder: "Distrito de San Isidro, Lima", required: true, max: 70, editorStep: "candidate", ...o }),
  /** clave: slogan */
  slogan: (o = {}) =>
    f.text({ label: "Lema", portalLabel: "Su lema de campaña", placeholder: "Juntos por un mejor San Isidro", max: 80, editorStep: "candidate", ...o }),
  /** clave: bio */
  bio: (o = {}) =>
    f.textarea({ label: "Quién es", portalLabel: "Cuéntanos quién es (opcional)", placeholder: "Vecino de San Isidro, ingeniero civil, padre de dos hijos…", max: 400, rows: 4, editorStep: "candidate", ...o }),

  // ── Partido ───────────────────────────────────────────────────────────────
  /** clave: partyName */
  partyName: (o = {}) =>
    f.text({ label: "Partido o movimiento", portalLabel: "Nombre del partido o movimiento", placeholder: "Movimiento Ciudadano Renovación", max: 60, editorStep: "party", ...o }),
  /** clave: partyLogo */
  partyLogo: (o = {}) =>
    f.image({ label: "Logo del partido", portalLabel: "Logo del partido", description: "Cuadrado y con fondo transparente se ve mejor.", editorStep: "party", ...o }),
  /** clave: ballotNumber · texto para no perder ceros ("08") */
  ballotNumber: (o = {}) =>
    f.text({
      label: "Número de votación",
      portalLabel: "Número en la cédula",
      description: "Sólo números. Ej. 08",
      placeholder: "08",
      required: true,
      max: 4,
      editorStep: "party",
      validate: (v) => (v && !/^\d{1,4}$/.test(v) ? "Escribe sólo números, por ejemplo 08." : undefined),
      ...o,
    }),
  /** clave: colorPrimary · el `default` lo pone cada diseño */
  colorPrimary: (o = {}) => f.color({ label: "Color principal del partido", editorStep: "party", ...o }),
  /** clave: colorAccent */
  colorAccent: (o = {}) => f.color({ label: "Color de acento", description: "Para resaltar números y botones.", editorStep: "party", ...o }),

  // ── Votación ──────────────────────────────────────────────────────────────
  /** clave: voteDate */
  voteDate: (o = {}) => f.date({ label: "Día de la votación", portalLabel: "Día de la votación", editorStep: "vote", ...o }),
  /** clave: voteTime */
  voteTime: (o = {}) => time("Hora de la votación", { editorStep: "vote", ...o }),

  // ── Equipo ────────────────────────────────────────────────────────────────
  /** clave: team */
  team: (o = {}) =>
    f.list({
      label: "Equipo de trabajo",
      itemLabel: "Integrante",
      description: "Cada uno con su foto y su cargo.",
      max: 12,
      editorStep: "team",
      item: f.group({
        fields: {
          photo: f.image({ label: "Foto" }),
          name: f.text({ label: "Nombre", placeholder: "Lucía Paredes", required: true, max: 60 }),
          role: f.text({ label: "Cargo", placeholder: "Candidata a regidora", required: true, max: 50 }),
        },
      }),
      ...o,
    }),

  // ── Propuestas ────────────────────────────────────────────────────────────
  /** clave: proposals */
  proposals: (o = {}) =>
    f.list({
      label: "Propuestas",
      itemLabel: "Propuesta",
      max: 8,
      editorStep: "proposals",
      item: f.group({
        fields: {
          icon: f.select({ label: "Ícono", options: PROPOSAL_ICONS, default: "star" }),
          title: f.text({ label: "Título", placeholder: "Parques seguros", required: true, max: 60 }),
          description: f.textarea({ label: "Descripción", max: 240, rows: 3 }),
        },
      }),
      ...o,
    }),

  // ── Links ─────────────────────────────────────────────────────────────────
  /** clave: links · cada botón lleva su ícono, su etiqueta y su link */
  links: (o = {}) =>
    f.list({
      label: "Redes y links",
      itemLabel: "Link",
      description: "Elige la red, ponle una etiqueta (ej. «Fanpage») y pega el link. Puede ser una página, un grupo de WhatsApp, etc.",
      max: 12,
      editorStep: "links",
      item: f.group({
        fields: {
          network: f.select({ label: "Red", options: NETWORKS.map(({ value, label }) => ({ value, label })), default: "facebook", required: true }),
          label: f.text({ label: "Etiqueta", description: "Si la dejas vacía se usa una por defecto.", placeholder: "Fanpage", max: 40 }),
          url: f.text({ label: "Link, teléfono o correo", placeholder: "https://…", required: true, max: 300 }),
        },
        validate: (value) => checkLink(value),
      }),
      ...o,
    }),

  // ── Campañas ──────────────────────────────────────────────────────────────
  /** clave: campaign · la que llena el cliente */
  campaign: (o = {}) =>
    campaignGroup({
      label: "Campaña",
      portalLabel: "Una campaña: la última que hizo o la próxima a la que invita",
      editorStep: "campaign",
      ...o,
    }),
  /** clave: history · sólo superadmin */
  history: (o = {}) =>
    f.list({
      label: "Historial de campañas",
      itemLabel: "Campaña",
      description: "Todas las que quieras. El cliente no ve ni edita esta lista.",
      max: 30,
      editorStep: "history",
      customerEditable: false,
      // Lo que se agrega aquí suele ser lo ya realizado.
      item: campaignGroup({ kind: "past" }),
      ...o,
    }),
};

/**
 * Schema completo de una tarjeta de político.
 * @param {{ primary?: string, accent?: string }} [colors] colores por defecto del diseño
 */
export function politicianSchema({ primary = "#0b57d0", accent = "#ffb300" } = {}) {
  return defineSchema({
    version: 1,
    steps: steps("candidate", "party", "vote", "team", "proposals", "links", "campaign", "history"),
    fields: {
      recipientName: p.name(),
      photo: p.photo(),
      office: p.office(),
      place: p.place(),
      slogan: p.slogan(),
      bio: p.bio(),
      partyName: p.partyName(),
      partyLogo: p.partyLogo(),
      ballotNumber: p.ballotNumber(),
      colorPrimary: p.colorPrimary({ default: primary }),
      colorAccent: p.colorAccent({ default: accent }),
      voteDate: p.voteDate(),
      voteTime: p.voteTime(),
      team: p.team(),
      proposals: p.proposals(),
      links: p.links(),
      campaign: p.campaign(),
      history: p.history(),
    },
  });
}

/** Manifest base de las tarjetas de político; cada diseño pone id, nombre, descripción y tema. */
export function politicianManifest(overrides) {
  return defineManifest({
    version: 1,
    occasions: ["politica", "campana"],
    defaultCollections: ["politica"],
    tier: "css",
    supportsMusic: false,
    // Una tarjeta de presentación abre directo: sin "toca para abrir".
    gate: "template",
    ...overrides,
  });
}
