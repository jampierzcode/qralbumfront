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
  party: { id: "party", title: "Partido", portalTitle: "Partido y logo" },
  background: { id: "background", title: "Fondo de la portada", portalTitle: "Fondo de la portada (opcional)" },
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

/** Modos de mezcla del fondo (mix-blend-mode). "Multiplicar" es el que mejor funciona sobre el color del partido. */
export const BG_BLENDS = Object.freeze([
  { value: "multiply", label: "Multiplicar (recomendado)" },
  { value: "overlay", label: "Superponer" },
  { value: "soft-light", label: "Luz suave" },
  { value: "luminosity", label: "Luminosidad" },
  { value: "screen", label: "Aclarar" },
]);

export const BG_POSITIONS = Object.freeze([
  { value: "center", label: "Centro" },
  { value: "top", label: "Arriba" },
  { value: "bottom", label: "Abajo" },
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
    f.image({ label: "Logo del partido", portalLabel: "Logo del partido", description: "El símbolo tal como aparece en la cédula. Cuadrado y con fondo transparente se ve mejor.", editorStep: "party", ...o }),
  /** clave: colorPrimary · el `default` lo pone cada diseño */
  colorPrimary: (o = {}) => f.color({ label: "Color principal del partido", editorStep: "party", ...o }),
  /** clave: colorAccent */
  colorAccent: (o = {}) => f.color({ label: "Color de acento", description: "Para resaltar números y botones.", editorStep: "party", ...o }),

  /**
   * clave: ballotShowPhoto · sólo diseños con cédula. Las cédulas de las elecciones regionales y
   * municipales 2026 (Perú) NO llevan foto: se marca el símbolo del partido. Por eso nace apagado.
   */
  ballotShowPhoto: (o = {}) =>
    f.toggle({
      label: "Mostrar la foto del candidato en la cédula",
      portalLabel: "¿La cédula de tu elección lleva foto del candidato?",
      description: "Las cédulas de las elecciones regionales y municipales 2026 no llevan foto: déjalo apagado. Actívalo sólo si en tu elección la cédula sí trae la foto (por ejemplo, las presidenciales).",
      default: false,
      editorStep: "party",
      ...o,
    }),

  // ── Fondo de la portada (diseños con foto de fondo) ─────────────────────
  /** clave: bgPhoto */
  bgPhoto: (o = {}) =>
    f.image({
      label: "Foto de fondo",
      portalLabel: "Foto de fondo de la portada",
      description: "Una foto de la ciudad, la plaza o una caminata. Se mezcla con el color del partido detrás del candidato.",
      editorStep: "background",
      ...o,
    }),
  /** clave: bgBlend */
  bgBlend: (o = {}) => f.select({ label: "Modo de mezcla", options: BG_BLENDS, default: "multiply", editorStep: "background", ...o }),
  /** clave: bgOpacity */
  bgOpacity: (o = {}) => f.number({ label: "Opacidad", description: "Qué tanto se ve la foto.", min: 0, max: 100, step: 5, default: 60, slider: true, unit: "%", editorStep: "background", ...o }),
  /** clave: bgSaturation · 0 = blanco y negro */
  bgSaturation: (o = {}) => f.number({ label: "Saturación", description: "0 = blanco y negro.", min: 0, max: 300, step: 10, default: 100, slider: true, unit: "%", editorStep: "background", ...o }),
  /** clave: bgContrast */
  bgContrast: (o = {}) => f.number({ label: "Contraste", min: 50, max: 200, step: 10, default: 100, slider: true, unit: "%", editorStep: "background", ...o }),
  /** clave: bgBrightness */
  bgBrightness: (o = {}) => f.number({ label: "Brillo", min: 50, max: 200, step: 10, default: 100, slider: true, unit: "%", editorStep: "background", ...o }),
  /** clave: bgBlur */
  bgBlur: (o = {}) => f.number({ label: "Desenfoque", min: 0, max: 20, step: 1, default: 0, slider: true, unit: " px", editorStep: "background", ...o }),
  /** clave: bgPosition */
  bgPosition: (o = {}) => f.select({ label: "Encuadre", options: BG_POSITIONS, default: "center", editorStep: "background", ...o }),

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
 * Extras opcionales que un diseño puede pedir. El resto de campos es idéntico en todos los diseños.
 *  · "background": foto de fondo con mezcla (multiplicar), opacidad, saturación, contraste, brillo, desenfoque y encuadre.
 *  · "ballot": interruptor para mostrar o no la foto del candidato dentro de la cédula.
 */
const EXTRAS = {
  background: {
    steps: ["background"],
    fields: () => ({
      bgPhoto: p.bgPhoto(),
      bgBlend: p.bgBlend(),
      bgOpacity: p.bgOpacity(),
      bgSaturation: p.bgSaturation(),
      bgContrast: p.bgContrast(),
      bgBrightness: p.bgBrightness(),
      bgBlur: p.bgBlur(),
      bgPosition: p.bgPosition(),
    }),
  },
  ballot: { steps: [], fields: () => ({ ballotShowPhoto: p.ballotShowPhoto() }) },
};

/** Claves que sólo existen cuando un diseño pide ese extra. */
export const EXTRA_FIELD_KEYS = Object.freeze(Object.fromEntries(Object.entries(EXTRAS).map(([name, extra]) => [name, Object.keys(extra.fields())])));

/**
 * Schema completo de una tarjeta de político.
 * @param {{ primary?: string, accent?: string, extras?: Array<"background"|"ballot"> }} [options] colores por defecto del diseño y extras
 */
export function politicianSchema({ primary = "#0b57d0", accent = "#ffb300", extras = [] } = {}) {
  for (const name of extras) if (!EXTRAS[name]) throw new Error(`Extra de político desconocido: "${name}".`);
  const chosen = extras.map((name) => EXTRAS[name]);
  const extraFields = Object.assign({}, ...chosen.map((extra) => extra.fields()));
  const withBackground = extras.includes("background");
  return defineSchema({
    version: 1,
    steps: steps("candidate", ...(withBackground ? ["background"] : []), "party", "vote", "team", "proposals", "links", "campaign", "history"),
    fields: {
      recipientName: p.name(),
      photo: p.photo(),
      office: p.office(),
      place: p.place(),
      slogan: p.slogan(),
      bio: p.bio(),
      partyName: p.partyName(),
      partyLogo: p.partyLogo(),
      colorPrimary: p.colorPrimary({ default: primary }),
      colorAccent: p.colorAccent({ default: accent }),
      ...extraFields,
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
