// Carritos de demostración: fotos del producto real, recortadas sin fondo
// (webp con transparencia). Viven en la plantilla, no en _demo-media, porque
// sólo las usa este ramo.
import cars from "./cars.json";

const urls = {
  "carrito-1": new URL("./carrito-1.webp", import.meta.url).href,
  "carrito-2": new URL("./carrito-2.webp", import.meta.url).href,
  "carrito-3": new URL("./carrito-3.webp", import.meta.url).href,
  "carrito-4": new URL("./carrito-4.webp", import.meta.url).href,
  "carrito-5": new URL("./carrito-5.webp", import.meta.url).href,
  "carrito-6": new URL("./carrito-6.webp", import.meta.url).href,
};

/** { media, refs } con los carritos pedidos (por nombre o los primeros N). */
export function demoCars(names = Object.keys(urls)) {
  const media = {};
  const refs = names.map((name) => {
    const id = `demo-${name}`;
    media[id] = { kind: "image", url: urls[name], ...cars[name] };
    return { assetId: id };
  });
  return { media, refs };
}
