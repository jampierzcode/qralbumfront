import { useEffect, useState } from "react";

/**
 * true si la foto es rectangular (esquinas superiores opacas) y false si es un recorte con
 * fondo transparente. `alphas` = canal alfa (0-255) de las esquinas superiores.
 */
export function isBoxedPhoto(alphas) {
  return alphas.length > 0 && alphas.every((a) => a > 240);
}

/**
 * Detecta si la foto del candidato es un recorte (fondo transparente) o una foto normal.
 * Devuelve "pending" mientras analiza y luego "cutout" | "boxed". Si no se puede leer la
 * imagen (CORS, error) cae en "cutout". Sólo lee píxeles del mismo origen (/media).
 */
export function useCutout(src) {
  const [kind, setKind] = useState(src ? "pending" : "cutout");
  useEffect(() => {
    if (!src || typeof Image === "undefined") {
      setKind("cutout");
      return;
    }
    let cancelled = false;
    setKind("pending");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const alpha = (x, y) => data[(y * size + x) * 4 + 3];
        setKind(isBoxedPhoto([alpha(0, 0), alpha(size - 1, 0), alpha(0, 3), alpha(size - 1, 3)]) ? "boxed" : "cutout");
      } catch {
        setKind("cutout");
      }
    };
    img.onerror = () => !cancelled && setKind("cutout");
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return kind;
}
