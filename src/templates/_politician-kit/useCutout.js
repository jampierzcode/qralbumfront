import { useEffect, useState } from "react";
import { pixelSource, readPixels } from "./pixels.js";

/**
 * true si la foto es rectangular (esquinas superiores opacas) y false si es un recorte con
 * fondo transparente. `alphas` = canal alfa (0-255) de las esquinas superiores.
 */
export function isBoxedPhoto(alphas) {
  return alphas.length > 0 && alphas.every((a) => a > 240);
}

/** "cutout" | "boxed" a partir de los píxeles RGBA de la foto reducida a `size`×`size`; null si no hay píxeles. */
export function classifyPixels(data, size = 32) {
  if (!data) return null;
  const alpha = (x, y) => data[(y * size + x) * 4 + 3];
  return isBoxedPhoto([alpha(0, 0), alpha(size - 1, 0), alpha(0, 3), alpha(size - 1, 3)]) ? "boxed" : "cutout";
}

/**
 * Detecta si la foto del candidato es un recorte (fondo transparente) o una foto normal.
 * Acepta la imagen preparada ({ src, placeholder… }) o una URL. Devuelve "pending" mientras analiza y luego
 * "cutout" | "boxed"; si no se puede leer, cae en "cutout". Usa la miniatura embebida, así funciona igual con
 * almacenamiento local que con un bucket S3 sin CORS.
 */
export function useCutout(image) {
  const source = pixelSource(image);
  const [kind, setKind] = useState(source ? "pending" : "cutout");
  useEffect(() => {
    if (!source) {
      setKind("cutout");
      return undefined;
    }
    let cancelled = false;
    setKind("pending");
    readPixels(source, { size: 32 }).then((data) => {
      if (!cancelled) setKind(classifyPixels(data, 32) || "cutout");
    });
    return () => {
      cancelled = true;
    };
  }, [source]);
  return kind;
}
