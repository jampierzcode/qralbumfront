// Registro de plantillas del frontend.
// Cada carpeta src/templates/<id>/index.js se registra SOLA (import.meta.glob).
// Las carpetas que empiezan con "_" (ej. _demo-media) se ignoran.
import { lazy } from "react";

const modules = import.meta.glob("../templates/*/index.js", { eager: true });

const REQUIRED = ["manifest", "schema", "demo", "loadExperience"];

function register() {
  const map = new Map();
  for (const [file, mod] of Object.entries(modules)) {
    const folder = file.split("/").at(-2);
    if (folder.startsWith("_")) continue;

    const definition = mod.default;
    const missing = REQUIRED.filter((key) => !definition?.[key]);
    if (missing.length) {
      throw new Error(`La plantilla "${folder}" no exporta: ${missing.join(", ")}.`);
    }
    if (definition.manifest.id !== folder) {
      throw new Error(`La plantilla "${folder}" tiene manifest.id "${definition.manifest.id}". Deben coincidir.`);
    }
    map.set(folder, Object.freeze({ ...definition, Experience: lazy(definition.loadExperience) }));
  }
  return map;
}

const templates = register();

export function getTemplate(templateId) {
  return templates.get(templateId) || null;
}

export function listTemplates() {
  return [...templates.values()];
}

/** Descarga el código de la experiencia por adelantado (ej. mientras se muestra "toca para abrir"). */
export function preloadExperience(templateId) {
  return getTemplate(templateId)?.loadExperience().catch(() => {});
}
