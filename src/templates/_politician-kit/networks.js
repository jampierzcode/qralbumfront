// Redes y links de la tarjeta de político. ESM puro y sin dependencias:
// lo importan el schema (y con él el backend, que valida) y las Experience.
//
// Regla de seguridad: un link sólo puede terminar en https:, tel: o mailto:.
// linkHref() lo garantiza aunque el contenido se haya guardado sin validar.

/** `tag` = etiqueta sugerida cuando el vendedor/cliente deja la etiqueta vacía. */
export const NETWORKS = Object.freeze([
  { value: "facebook", label: "Facebook", tag: "Fanpage" },
  { value: "instagram", label: "Instagram", tag: "Instagram" },
  { value: "tiktok", label: "TikTok", tag: "TikTok" },
  { value: "youtube", label: "YouTube", tag: "Canal de YouTube" },
  { value: "whatsapp", label: "WhatsApp (número)", tag: "Escríbenos por WhatsApp" },
  { value: "whatsapp-group", label: "Grupo de WhatsApp", tag: "Únete al grupo de WhatsApp" },
  { value: "x", label: "X (Twitter)", tag: "X" },
  { value: "telegram", label: "Telegram", tag: "Telegram" },
  { value: "web", label: "Página web", tag: "Página web" },
  { value: "email", label: "Correo", tag: "Correo" },
  { value: "phone", label: "Teléfono", tag: "Llámanos" },
  { value: "map", label: "Ubicación o local", tag: "Nuestro local" },
  { value: "other", label: "Otro link", tag: "Más información" },
]);

const HTTPS = /^https:\/\/[^\s/$.?#][^\s]*$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s().-]{6,20}$/;
const GROUP = /^https:\/\/chat\.whatsapp\.com\/\S+$/i;

const digitsOf = (value) => String(value || "").replace(/\D/g, "");
const isPhone = (value) => PHONE.test(value) && digitsOf(value).length >= 6;

export function networkOf(value) {
  return NETWORKS.find((n) => n.value === value) || NETWORKS.at(-1);
}

/** Etiqueta a mostrar: la que puso la persona o la sugerida de la red. */
export function linkLabel(item) {
  return (item?.label || "").trim() || networkOf(item?.network).tag;
}

/**
 * Mensaje de error (o undefined si está bien) para un link según su red.
 * Se usa como `validate` del grupo, que recibe { network, label, url }.
 */
export function checkLink(item) {
  const url = String(item?.url || "").trim();
  if (!url) return undefined;
  switch (item?.network) {
    case "phone":
      return isPhone(url) ? undefined : "Escribe un teléfono válido, por ejemplo +51 987 654 321.";
    case "email":
      return EMAIL.test(url) ? undefined : "Escribe un correo válido.";
    case "whatsapp":
      return isPhone(url) || HTTPS.test(url) ? undefined : "Escribe el número con código de país (+51 987 654 321) o pega un link https://wa.me/…";
    case "whatsapp-group":
      return GROUP.test(url) ? undefined : "Pega el link de invitación del grupo (https://chat.whatsapp.com/…).";
    default:
      return HTTPS.test(url) ? undefined : "Pega un link que empiece con https://";
  }
}

/** href seguro para un link, o "" si no se puede armar. */
export function linkHref(item) {
  const url = String(item?.url || "").trim();
  if (!url) return "";
  switch (item?.network) {
    case "phone":
      return isPhone(url) ? `tel:${url.startsWith("+") ? "+" : ""}${digitsOf(url)}` : "";
    case "email":
      return EMAIL.test(url) ? `mailto:${url}` : "";
    case "whatsapp":
      if (isPhone(url)) return `https://wa.me/${digitsOf(url)}`;
      return HTTPS.test(url) ? url : "";
    default:
      return HTTPS.test(url) ? url : "";
  }
}

/** Ícono que corresponde a la red (whatsapp-group comparte el de WhatsApp). */
export function iconOfNetwork(network) {
  return network === "whatsapp-group" ? "whatsapp" : network;
}

/** Devuelve el link sólo si es https válido; si no, "" (para portadas, transmisiones, etc.). */
export function safeHttps(url) {
  const value = String(url || "").trim();
  return HTTPS.test(value) ? value : "";
}
