// Formatos y datos derivados de la tarjeta de político. Sin dependencias.
import { dateParts } from "../_wedding-kit/format.js";
export { calendarLink, dateParts, eventDateTime, formatLongDate, formatTime, initial } from "../_wedding-kit/format.js";

const DAY = 86400000;

/** Días de calendario que faltan hasta `iso` (YYYY-MM-DD): 0 = hoy, negativo = ya pasó, null = sin fecha. */
export function daysUntil(iso, now = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return null;
  const target = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / DAY);
}

/** "Faltan 5 días", "¡Mañana!", "¡Hoy se vota!" */
export function votingCountdownText(days) {
  if (days === null || days < 0) return "";
  if (days === 0) return "¡Hoy se vota!";
  if (days === 1) return "¡Mañana se vota!";
  return `Faltan ${days} días`;
}

const hasCampaign = (c) => Boolean(c && (c.title || c.description || c.cover || c.streamUrl || c.place));

/**
 * Todas las campañas a mostrar: la que llenó el cliente (`campaign`) + el historial que agrega
 * el superadmin (`history`). Orden: primero las próximas (la más cercana arriba) y luego las
 * realizadas (la más reciente arriba). Una "próxima" cuya fecha ya pasó cuenta como realizada,
 * así una tarjeta olvidada no sigue invitando a algo que ya ocurrió.
 * @returns {{ upcoming: object[], past: object[] }}
 */
export function campaignList(content = {}, now = new Date()) {
  const all = [content.campaign, ...(Array.isArray(content.history) ? content.history : [])].filter(hasCampaign);
  const upcoming = [];
  const past = [];
  for (const campaign of all) {
    const days = daysUntil(campaign.date, now);
    const isUpcoming = campaign.kind !== "past" && (days === null || days >= 0);
    (isUpcoming ? upcoming : past).push({ ...campaign, days, kind: isUpcoming ? "upcoming" : "past" });
  }
  const byDate = (dir) => (a, b) => {
    if (a.days === null && b.days === null) return 0;
    if (a.days === null) return 1;
    if (b.days === null) return -1;
    return dir * (a.days - b.days);
  };
  upcoming.sort(byDate(1));
  past.sort(byDate(-1));
  return { upcoming, past };
}

/** "Miércoles 21 de octubre" (con el año si no es el actual). */
export function formatVoteDate(iso, now = new Date()) {
  const p = dateParts(iso);
  if (!p) return "";
  const base = `${p.weekday} ${Number(p.day)} de ${p.month.toLowerCase()}`;
  return Number(p.year) === now.getFullYear() ? base : `${base} de ${p.year}`;
}

/** "Sáb 12 Oct" (con el año si no es el actual) para las tarjetas de campaña. */
export function formatCampaignDate(iso, now = new Date()) {
  const p = dateParts(iso);
  if (!p) return "";
  const base = `${p.weekday.slice(0, 3)} ${Number(p.day)} ${p.monthShort}`;
  return Number(p.year) === now.getFullYear() ? base : `${base} ${p.year}`;
}

function luminance(hex) {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "");
  if (!m) return null;
  const [r, g, b] = m.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste WCAG entre dos colores `#rrggbb` (1 a 21). 1 si alguno es inválido. */
export function contrastRatio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return 1;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mezcla `a` con `b` (t = 0 → a, t = 1 → b). Devuelve `#rrggbb`; si `a` es inválido lo devuelve tal cual. */
export function mixHex(a, b, t) {
  const ma = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(a || "");
  const mb = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(b || "");
  if (!ma || !mb) return a;
  const out = [1, 2, 3].map((i) => Math.round(parseInt(ma[i], 16) * (1 - t) + parseInt(mb[i], 16) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Color de texto más legible (`light` o `dark`) sobre un fondo `#rrggbb`. */
export function contrastColor(hex, light = "#ffffff", dark = "#111827") {
  if (luminance(hex) === null) return light;
  return contrastRatio(hex, light) >= contrastRatio(hex, dark) ? light : dark;
}

/** El mismo color, oscurecido lo justo para leerse como texto o ícono sobre blanco (un amarillo pasa a mostaza). */
export function readableOnLight(hex, min = 4.5) {
  if (luminance(hex) === null) return hex;
  let color = hex;
  for (let step = 1; step <= 20 && contrastRatio(color, "#ffffff") < min; step += 1) color = mixHex(hex, "#000000", step * 0.05);
  return color;
}

/** `hex` si se distingue sobre `background`; si no, `fallback` (por defecto blanco). */
export function visibleOn(hex, background, { min = 3, fallback = "#ffffff" } = {}) {
  return contrastRatio(hex, background) >= min ? hex : fallback;
}
