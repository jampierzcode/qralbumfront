// Preparación de archivos en el navegador antes de subirlos.
// Las fotos de celular (4000px, 4-8 MB) se reducen a ~2560px JPEG: suben más
// rápido por datos móviles. El servidor igual vuelve a procesarlas (variantes WebP).

const MAX_EDGE = 2560;
const QUALITY = 0.86;
const SKIP_BELOW_BYTES = 1.2 * 1024 * 1024;

export const ACCEPT = {
  image: "image/*",
  audio: "audio/*,.mp3,.m4a,.aac,.wav,.ogg",
  video: "video/mp4,video/webm,video/quicktime",
};

export const LIMITS_MB = { image: 25, audio: 30, video: 150 };

function loadWithImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close?.() };
    } catch {
      /* Safari antiguo / formatos raros: intentar con <img> */
    }
  }
  return loadWithImageElement(file);
}

/** Reduce y convierte a JPEG cuando conviene. Si el navegador no puede decodificar, devuelve el original. */
export async function compressImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    return file;
  }
  try {
    const { width, height } = decoded;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const alreadyLight = scale === 1 && file.size < SKIP_BELOW_BYTES && /jpe?g|png|webp/.test(file.type);
    if (alreadyLight) return file;

    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(decoded.source, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = (file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    decoded.release();
  }
}

/** Duración de audio/video leída en el navegador (se envía al servidor). */
export function readDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = document.createElement(file.type.startsWith("video/") ? "video" : "audio");
    const done = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    el.preload = "metadata";
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : null);
    el.onerror = () => done(null);
    setTimeout(() => done(null), 4000);
    el.src = url;
  });
}

export function kindOfFile(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (/\.(mp3|m4a|aac|wav|ogg)$/i.test(file.name)) return "audio";
  return null;
}

export function formatMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
