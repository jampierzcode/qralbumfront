// Cliente HTTP mínimo para las páginas públicas (sin axios ni sesión de admin).
const BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function publicRequest(path, { method = "GET", body, signal, keepalive } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      signal,
      keepalive,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(0, "No hay conexión. Revisa tu internet e inténtalo de nuevo.");
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data.error || "Ocurrió un error inesperado.", data.details);
  return data;
}

export function sendGiftEvent(slug, type) {
  return publicRequest(`/public/gifts/${encodeURIComponent(slug)}/events`, {
    method: "POST",
    body: { type },
    keepalive: true,
  }).catch(() => {});
}
