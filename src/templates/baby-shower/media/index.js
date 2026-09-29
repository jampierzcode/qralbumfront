// Ilustraciones de bebé de la plantilla (niño en azul, niña en rosado).
// Viven aquí y no en _demo-media porque sólo las usa el baby shower: son el
// ejemplo del demo y la portada por defecto cuando el comprador no sube foto.
import babies from "./babies.json";

const urls = {
  "baby-boy": new URL("./baby-boy.webp", import.meta.url).href,
  "baby-girl": new URL("./baby-girl.webp", import.meta.url).href,
};

const qrUrls = {
  "qr-yape": new URL("./qr-yape.webp", import.meta.url).href,
  "qr-plin": new URL("./qr-plin.webp", import.meta.url).href,
};

/** { media, ref } de un QR de ejemplo (imagen cuadrada de 480 px), para el demo de los métodos de pago. */
export function demoQr(name) {
  const id = `demo-${name}`;
  return { media: { [id]: { kind: "image", url: qrUrls[name], width: 480, height: 480 } }, ref: { assetId: id } };
}

export const BABY_BY_GENDER = { boy: "baby-boy", girl: "baby-girl", surprise: "baby-girl" };

/** Imagen ya preparada ({ src, width, height, placeholder }) para usar sin pasar por el motor. */
export function babyIllustration(gender) {
  const name = BABY_BY_GENDER[gender] || BABY_BY_GENDER.girl;
  return { src: urls[name], ...babies[name] };
}

/** { media, ref } del bebé pedido, para el demo. */
export function demoBaby(name) {
  const id = `demo-${name}`;
  return { media: { [id]: { kind: "image", url: urls[name], ...babies[name] } }, ref: { assetId: id } };
}
