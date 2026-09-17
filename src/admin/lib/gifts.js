import { getTemplate } from "../../engine/registry.js";

export const STATUS = {
  draft: { label: "Borrador", tone: "neutral" },
  collecting_content: { label: "Esperando contenido", tone: "amber" },
  ready: { label: "Listo para publicar", tone: "blue" },
  published: { label: "Publicado", tone: "green" },
  archived: { label: "Archivado", tone: "stone" },
};

// Revisión de los regalos de un referido.
export const REVIEW = {
  none: { label: "Sin enviar", tone: "neutral" },
  pending: { label: "Por aprobar", tone: "amber" },
  approved: { label: "Aprobado", tone: "green" },
  rejected: { label: "Rechazado", tone: "red" },
};

export function money(amount, currency = "PEN") {
  if (amount === null || amount === undefined) return "—";
  const symbol = currency === "PEN" ? "S/" : `${currency} `;
  return `${symbol}${Number(amount).toFixed(2)}`;
}

export const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Borradores" },
  { value: "collecting_content", label: "Esperando contenido" },
  { value: "ready", label: "Listos" },
  { value: "published", label: "Publicados" },
  { value: "archived", label: "Archivados" },
];

// Base de los links que se comparten (en local conviene definir VITE_PUBLIC_URL con la IP o el dominio).
export const PUBLIC_BASE = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, "");

export const giftUrl = (slug) => `${PUBLIC_BASE}/g/${slug}`;
export const uploadUrl = (token) => `${PUBLIC_BASE}/upload/${token}`;
export const demoUrl = (templateId) => `${PUBLIC_BASE}/demo/${templateId}`;

export function whatsappUrl(text, phone) {
  const digits = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function templateName(templateId) {
  return getTemplate(templateId)?.manifest.name || templateId;
}

export function giftTitle(gift) {
  return gift.recipientName ? `Para ${gift.recipientName}` : "Sin destinatario";
}

export const OCCASION_LABELS = {
  "flores-amarillas": "Día de las flores amarillas",
  amor: "Amor",
  aniversario: "Aniversario",
  cumpleanos: "Cumpleaños",
  amistad: "Amistad",
  "san-valentin": "San Valentín",
  "dia-de-la-madre": "Día de la madre",
  perdon: "Pedir perdón",
  propuesta: "Propuesta",
  graduacion: "Graduación",
  empresarial: "Regalo empresarial",
};

export const occasionLabel = (value) => OCCASION_LABELS[value] || value;
