const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
const dateFmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });

const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

/** "hace 5 minutos", "ayer", "hace 3 semanas" */
export function timeAgo(value) {
  if (!value) return "";
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  if (Math.abs(seconds) < 45) return "hace un momento";
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "minute") return rtf.format(Math.round(seconds / size), unit);
  }
  return "";
}

export function formatDate(value) {
  return value ? dateFmt.format(new Date(value)) : "";
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}
