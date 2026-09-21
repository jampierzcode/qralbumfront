import { useEffect, useState } from "react";

/**
 * Color medio ({ r, g, b }) de una foto, con los mismos filtros CSS que se le aplican (saturación, contraste, brillo).
 * Devuelve null mientras carga o si no se puede leer (CORS, error). Sólo lee píxeles del mismo origen (/media).
 * `filter` es una cadena CSS como "saturate(100%) contrast(110%)"; si el navegador no soporta filtros en canvas, se ignora.
 */
export function usePhotoMean(src, filter = "") {
  const [mean, setMean] = useState(null);
  useEffect(() => {
    if (!src || typeof Image === "undefined") {
      setMean(null);
      return undefined;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 16;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (filter && "filter" in ctx) ctx.filter = filter;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        setMean({ r: r / pixels, g: g / pixels, b: b / pixels });
      } catch {
        setMean(null);
      }
    };
    img.onerror = () => !cancelled && setMean(null);
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, filter]);
  return mean;
}
