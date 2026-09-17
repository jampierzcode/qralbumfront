export const GIFT_STATUSES = Object.freeze(["draft", "collecting_content", "ready", "published", "archived"]);

const ID = /^[a-z0-9][a-z0-9-]{1,62}$/;

/**
 * Metadatos de una plantilla. No contiene código visual.
 * @param {object} manifest
 * @param {string} manifest.id                 igual al nombre de la carpeta
 * @param {number} manifest.version            versión del schema
 * @param {string} manifest.name
 * @param {string} [manifest.description]
 * @param {string[]} [manifest.occasions]      ocasiones comerciales ("amor", "aniversario"…)
 * @param {string[]} [manifest.defaultCollections]  slugs de colecciones sugeridas
 * @param {number|null} [manifest.referralPrice]  precio de referido sugerido (sólo se usa al registrarla la primera vez)
 * @param {"css"|"canvas"|"3d"} [manifest.tier]
 * @param {boolean} [manifest.supportsMusic]
 * @param {"shell"|"template"} [manifest.gate]  quién muestra la pantalla "toca para abrir"
 * @param {{ title?: string, subtitle?: string, button?: string }} [manifest.gateCopy]
 * @param {{ background?: string, foreground?: string, accent?: string }} [manifest.theme]
 * @param {boolean} [manifest.preferFullscreen]
 * @param {string[]} [manifest.collectsResponses]  tipos de respuesta que acepta de los visitantes (ej. ["rsvp"])
 */
export function defineManifest(manifest) {
  if (!manifest || !ID.test(manifest.id || "")) throw new Error("defineManifest: id inválido.");
  if (!manifest.name) throw new Error(`defineManifest(${manifest.id}): falta name.`);
  const price = manifest.referralPrice;
  if (price !== undefined && price !== null && (!Number.isFinite(price) || price < 0 || price > 99999)) {
    throw new Error(`defineManifest(${manifest.id}): referralPrice inválido.`);
  }
  return Object.freeze({
    version: 1,
    description: "",
    occasions: [],
    defaultCollections: [],
    referralPrice: null,
    tier: "css",
    supportsMusic: false,
    gate: "shell",
    gateCopy: {},
    theme: {},
    preferFullscreen: false,
    collectsResponses: [],
    ...manifest,
  });
}
