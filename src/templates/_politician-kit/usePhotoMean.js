import { useEffect, useState } from "react";
import { pixelSource, readPixels } from "./pixels.js";

/** Color medio { r, g, b } de píxeles RGBA (0-255), o null si no hay. */
export function meanOfPixels(data) {
  if (!data || !data.length) return null;
  let r = 0;
  let g = 0;
  let b = 0;
  const count = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return { r: r / count, g: g / count, b: b / count };
}

/**
 * Color medio de una foto con los mismos filtros CSS que se le aplican (saturación, contraste, brillo).
 * Acepta la imagen preparada ({ src, placeholder… }) o una URL. Devuelve null mientras carga o si no se puede leer.
 * Usa la miniatura embebida: sirve para calcular un promedio y no depende de CORS (bucket S3 en producción).
 * Si el navegador no soporta filtros en canvas, el filtro se ignora (la estimación es aproximada).
 */
export function usePhotoMean(image, filter = "") {
  const source = pixelSource(image);
  const [mean, setMean] = useState(null);
  useEffect(() => {
    if (!source) {
      setMean(null);
      return undefined;
    }
    let cancelled = false;
    readPixels(source, { size: 16, filter }).then((data) => {
      if (!cancelled) setMean(meanOfPixels(data));
    });
    return () => {
      cancelled = true;
    };
  }, [source, filter]);
  return mean;
}
