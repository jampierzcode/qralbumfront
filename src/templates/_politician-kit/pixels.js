/**
 * Lee los píxeles de una imagen reducida a `size`×`size` (con filtros CSS opcionales) y devuelve un
 * Uint8ClampedArray RGBA, o null si no se puede (error de carga, CORS, sin canvas).
 *
 * Pásale la MINIATURA embebida de la imagen (`image.placeholder`, un data-URI): es del mismo origen y nunca
 * tiene problemas de CORS. La imagen real en producción viene de un bucket S3 (/media redirige a otro
 * dominio) y no se puede leer en un canvas sin CORS en el bucket.
 */
export function readPixels(src, { size = 16, filter = "" } = {}) {
  return new Promise((resolve) => {
    if (!src || typeof Image === "undefined") return resolve(null);
    const img = new Image();
    // Sólo las URL http(s) necesitan pedir CORS; un data: es del mismo origen.
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (filter && "filter" in ctx) ctx.filter = filter;
        ctx.drawImage(img, 0, 0, size, size);
        resolve(ctx.getImageData(0, 0, size, size).data);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Origen más fiable de una imagen preparada por gift-core: su miniatura embebida; si no hay, la URL. */
export function pixelSource(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.placeholder || image.src || "";
}
