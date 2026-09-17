// Formatos y links que comparten las invitaciones de boda. Sin dependencias.

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : "");

function parts(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) } : null;
}

/** "Sábado 17 de agosto de 2026" */
export function formatLongDate(iso) {
  const p = parts(iso);
  if (!p) return "";
  const weekday = new Intl.DateTimeFormat("es", { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  return `${capitalize(weekday)} ${p.day} de ${MONTHS[p.month - 1]} de ${p.year}`;
}

/** { weekday: "Sábado", day: "17", month: "Agosto", year: "2026" } para portadas tipo tarjeta. */
export function dateParts(iso) {
  const p = parts(iso);
  if (!p) return null;
  const weekday = new Intl.DateTimeFormat("es", { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  return {
    weekday: capitalize(weekday),
    day: String(p.day).padStart(2, "0"),
    month: capitalize(MONTHS[p.month - 1]),
    monthShort: capitalize(MONTHS[p.month - 1]).slice(0, 3),
    year: String(p.year),
    shortYear: String(p.year).slice(2),
  };
}

/** "28.11.27" */
export function formatDotDate(iso) {
  const p = dateParts(iso);
  return p ? `${p.day}.${String(parts(iso).month).padStart(2, "0")}.${p.shortYear}` : "";
}

/** "5:30 PM" */
export function formatTime(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return hhmm || "";
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
}

/** Date local del evento (o null). */
export function eventDateTime(iso, hhmm) {
  if (!iso) return null;
  const time = /^\d{1,2}:\d{2}$/.test(hhmm || "") ? `${hhmm.padStart(5, "0")}:00` : "00:00:00";
  const date = new Date(`${iso}T${time}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapsLink(venue, address, url) {
  if (url) return url;
  const query = `${venue || ""} ${address || ""}`.trim();
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}

export function wazeLink(venue, address) {
  const query = `${address || venue || ""}`.trim();
  return query ? `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes` : "";
}

export function whatsappLink(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Link para agendar en Google Calendar (funciona también en móvil). */
export function calendarLink({ title, start, hours = 5, location, details }) {
  if (!start) return "";
  const stamp = (date) => `${date.toISOString().replace(/[-:]|\.\d{3}/g, "")}`;
  const end = new Date(start.getTime() + hours * 3600000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title || "Boda",
    dates: `${stamp(start)}/${stamp(end)}`,
    ...(location ? { location } : {}),
    ...(details ? { details } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function initial(name) {
  return (String(name || "").trim()[0] || "").toUpperCase();
}

/** "V & S" */
export function monogram(a, b, separator = " & ") {
  return [initial(a), initial(b)].filter(Boolean).join(separator);
}

export const DRESS_CODE_LABELS = Object.freeze({
  rigurosa: "Etiqueta rigurosa",
  etiqueta: "Etiqueta",
  formal: "Formal",
  semiformal: "Semiformal",
  coctel: "Cóctel",
  playa: "Playa / casual elegante",
});

export const DRESS_CODE_HINTS = Object.freeze({
  rigurosa: "Ellos, frac o esmoquin. Ellas, vestido largo.",
  etiqueta: "Ellos, esmoquin o traje oscuro. Ellas, vestido largo.",
  formal: "Ellos, traje. Ellas, vestido largo o midi.",
  semiformal: "Ellos, traje sin corbata. Ellas, vestido midi.",
  coctel: "Ellos, traje claro. Ellas, vestido corto o midi.",
  playa: "Lino, colores claros y calzado cómodo.",
});
