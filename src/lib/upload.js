// Subida con progreso real (fetch no expone progreso de subida en todos los navegadores).

/**
 * @param {string} url
 * @param {FormData} formData
 * @param {{ headers?: Record<string,string>, onProgress?: (ratio:number)=>void, signal?: AbortSignal }} [options]
 * @returns {Promise<any>} JSON de respuesta
 */
export function uploadWithProgress(url, formData, { headers = {}, onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      let data = {};
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        /* respuesta no JSON */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else {
        const error = new Error(data.error || "No se pudo subir el archivo.");
        error.status = xhr.status;
        reject(error);
      }
    };
    xhr.onerror = () => reject(Object.assign(new Error("Se perdió la conexión. Toca para reintentar."), { status: 0 }));
    xhr.onabort = () => reject(Object.assign(new Error("Subida cancelada."), { name: "AbortError" }));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(formData);
  });
}
