// Formatos y datos derivados de la tarjeta de político. Sin dependencias.
export { dateParts, eventDateTime, formatLongDate, formatTime, initial } from "../_wedding-kit/format.js";

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
