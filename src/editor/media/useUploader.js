import { useCallback, useEffect, useRef } from "react";
import { compressImage, kindOfFile, LIMITS_MB, readDuration } from "./processFile.js";

// Semáforo simple: máximo N subidas simultáneas (redes móviles).
function createLimiter(max) {
  let active = 0;
  const queue = [];
  const next = () => {
    if (active >= max || !queue.length) return;
    active++;
    const { task, resolve, reject } = queue.shift();
    task()
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (task) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      next();
    });
}

/**
 * Prepara y sube un archivo usando el adaptador de media del formulario.
 * @param {{ upload: (file: File, opts: { kind: string, durationSec?: number, onProgress: (r:number)=>void, signal: AbortSignal }) => Promise<object> }} adapter
 */
export function useUploader(adapter) {
  const limiterRef = useRef(null);
  if (!limiterRef.current) limiterRef.current = createLimiter(3);
  const controllers = useRef(new Set());

  useEffect(() => () => controllers.current.forEach((c) => c.abort()), []);

  return useCallback(
    async (file, expectedKind, { onStage, onProgress } = {}) => {
      const kind = kindOfFile(file);
      if (!kind || kind !== expectedKind) {
        const labels = { image: "una foto", audio: "un audio", video: "un video" };
        throw new Error(`Este archivo no es ${labels[expectedKind]}.`);
      }

      onStage?.("preparing");
      const prepared = kind === "image" ? await compressImage(file) : file;
      if (prepared.size > LIMITS_MB[kind] * 1024 * 1024) {
        throw new Error(`Pesa demasiado (máximo ${LIMITS_MB[kind]} MB).`);
      }
      const durationSec = kind === "image" ? undefined : await readDuration(prepared);

      const controller = new AbortController();
      controllers.current.add(controller);
      try {
        return await limiterRef.current(() => {
          onStage?.("uploading");
          return adapter.upload(prepared, { kind, durationSec, onProgress, signal: controller.signal });
        });
      } finally {
        controllers.current.delete(controller);
      }
    },
    [adapter]
  );
}
