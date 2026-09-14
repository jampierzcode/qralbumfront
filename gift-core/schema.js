import { FIELD_TYPES } from "./fields.js";

// Claves que se guardan en columnas del Gift (no dentro de content) pero que
// las plantillas pueden declarar como campos normales.
export const BOUND_KEYS = Object.freeze(["recipientName", "senderName"]);

const DEFAULT_STEP = Object.freeze({ id: "content", title: "Contenido", description: "" });

function assertField(field, path) {
  if (!field || !FIELD_TYPES.includes(field.type)) {
    throw new Error(`Campo "${path}": tipo inválido. Usa los constructores de f (f.text, f.images…).`);
  }
  if (field.type === "group") {
    for (const [key, sub] of Object.entries(field.fields)) assertField(sub, `${path}.${key}`);
  }
  if (field.type === "list") assertField(field.item, `${path}[]`);
  if (field.min !== undefined && field.max !== undefined && typeof field.min === "number" && field.min > field.max) {
    throw new Error(`Campo "${path}": min no puede ser mayor que max.`);
  }
}

/**
 * Define el schema de una plantilla.
 * @param {{ version?: number, steps?: Array<{id:string,title:string,description?:string,portalTitle?:string,portalDescription?:string}>, fields: Record<string, object> }} definition
 */
export function defineSchema({ version = 1, steps = [], fields }) {
  if (!fields || typeof fields !== "object") throw new Error("defineSchema necesita `fields`.");
  const stepIds = new Set(steps.map((s) => s.id));
  for (const [key, field] of Object.entries(fields)) {
    assertField(field, key);
    if (field.editorStep && !stepIds.has(field.editorStep)) {
      throw new Error(`Campo "${key}": el paso "${field.editorStep}" no está declarado en steps.`);
    }
  }
  return Object.freeze({
    version,
    steps: Object.freeze(steps.map((s) => Object.freeze({ description: "", ...s }))),
    fields: Object.freeze({ ...fields }),
  });
}

export function getFieldEntries(schema) {
  return Object.entries(schema.fields);
}

/** Claves que el comprador puede completar desde el portal. */
export function getCustomerEditableKeys(schema) {
  return getFieldEntries(schema)
    .filter(([, field]) => field.customerEditable !== false)
    .map(([key]) => key);
}

/**
 * Agrupa los campos en pasos para el editor y el portal.
 * @param {object} schema
 * @param {{ keys?: string[] }} [options] limitar a ciertas claves (portal)
 */
export function getSteps(schema, { keys } = {}) {
  const allowed = keys ? new Set(keys) : null;
  const entries = getFieldEntries(schema).filter(([key]) => !allowed || allowed.has(key));
  const declared = [...schema.steps, DEFAULT_STEP];
  return declared
    .map((step) => ({
      ...step,
      fields: entries.filter(([, field]) => (field.editorStep || DEFAULT_STEP.id) === step.id),
    }))
    .filter((step) => step.fields.length > 0);
}

function defaultFor(field) {
  if (field.default !== undefined) return typeof field.default === "object" ? structuredClone(field.default) : field.default;
  switch (field.type) {
    case "images":
      return [];
    case "list":
      return [];
    case "group":
      return Object.fromEntries(Object.entries(field.fields).map(([k, sub]) => [k, defaultFor(sub)]));
    case "toggle":
      return false;
    case "text":
    case "textarea":
      return "";
    default:
      return null;
  }
}

/** Valores iniciales para un regalo nuevo. */
export function getDefaults(schema) {
  return Object.fromEntries(getFieldEntries(schema).map(([key, field]) => [key, defaultFor(field)]));
}

export function getItemDefaults(listField) {
  return defaultFor(listField.item);
}

/** Separa los valores del editor en { content, bound } (bound va a columnas del Gift). */
export function splitBoundValues(values = {}) {
  const content = { ...values };
  const bound = {};
  for (const key of BOUND_KEYS) {
    if (key in content) {
      bound[key] = content[key] ?? "";
      delete content[key];
    }
  }
  return { content, bound };
}

/** Une content + columnas del Gift en los valores que ve el editor. */
export function mergeBoundValues(content = {}, gift = {}) {
  const values = { ...content };
  for (const key of BOUND_KEYS) values[key] = gift[key] ?? "";
  return values;
}
