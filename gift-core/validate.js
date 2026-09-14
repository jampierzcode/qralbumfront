import { MEDIA_KIND_BY_TYPE } from "./fields.js";
import { getFieldEntries } from "./schema.js";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const COLOR = /^#[0-9a-f]{6}$/i;
const UUIDISH = /^[A-Za-z0-9_-]{1,64}$/;

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

function labelOf(field, key) {
  return field.label || key;
}

function isEmpty(field, value) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (field.type === "images" || field.type === "list") return !Array.isArray(value) || value.length === 0;
  if (field.type === "group") {
    if (typeof value !== "object" || Array.isArray(value)) return true;
    return Object.entries(field.fields).every(([key, sub]) => isEmpty(sub, value[key]));
  }
  return false;
}

function isValidDate(value) {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Valida y sanea el contenido de un regalo contra el schema de su plantilla.
 *
 * @param {object} schema
 * @param {object} values  contenido (puede incluir recipientName/senderName)
 * @param {object} [options]
 * @param {"draft"|"publish"} [options.mode="draft"]  draft: sólo forma y máximos · publish: además obligatorios y mínimos
 * @param {string[]} [options.keys]   si se indica, sólo estas claves de primer nivel están permitidas (portal)
 * @param {Record<string,{kind:string}>} [options.assets]  media disponible del regalo para verificar referencias
 * @returns {{ valid: boolean, errors: Array<{path:string, message:string}>, value: object }}
 */
export function validateContent(schema, values, { mode = "draft", keys, assets } = {}) {
  const errors = [];
  const strict = mode === "publish";
  const input = values && typeof values === "object" && !Array.isArray(values) ? values : {};
  const allowed = keys ? new Set(keys) : null;
  const value = {};

  const fail = (path, message) => errors.push({ path, message });

  function checkMediaRef(field, ref, path, label) {
    if (!ref || typeof ref !== "object" || typeof ref.assetId !== "string" || !UUIDISH.test(ref.assetId)) {
      fail(path, `${label}: archivo inválido.`);
      return undefined;
    }
    if (assets) {
      const asset = assets[ref.assetId];
      const kind = MEDIA_KIND_BY_TYPE[field.type];
      if (!asset) {
        fail(path, `${label}: el archivo ya no existe. Súbelo otra vez.`);
        return undefined;
      }
      if (asset.kind !== kind) {
        fail(path, `${label}: tipo de archivo incorrecto.`);
        return undefined;
      }
    }
    return { assetId: ref.assetId };
  }

  function walk(field, raw, path, label, rootValues) {
    const empty = isEmpty(field, raw);

    if (empty) {
      if (strict && field.required) fail(path, `${label} es obligatorio.`);
      if (field.type === "images" || field.type === "list") {
        if (strict && field.min > 0 && !field.required) fail(path, `${label}: agrega al menos ${field.min}.`);
        return [];
      }
      if (field.type === "group") return walkGroup(field, raw || {}, path, rootValues);
      if (field.type === "toggle") return raw === undefined || raw === null ? undefined : Boolean(raw);
      if (typeof raw === "string") return raw;
      return raw === undefined ? undefined : null;
    }

    let result;
    switch (field.type) {
      case "text":
      case "textarea": {
        if (typeof raw !== "string") {
          fail(path, `${label} debe ser texto.`);
          return undefined;
        }
        const length = raw.trim().length;
        if (field.max && raw.length > field.max) fail(path, `${label}: máximo ${plural(field.max, "carácter", "caracteres")}.`);
        if (strict && field.min && length < field.min) fail(path, `${label}: mínimo ${plural(field.min, "carácter", "caracteres")}.`);
        result = raw;
        break;
      }
      case "date": {
        if (!isValidDate(raw)) {
          fail(path, `${label}: fecha inválida.`);
          return undefined;
        }
        if (field.min && raw < field.min) fail(path, `${label}: debe ser posterior a ${field.min}.`);
        if (field.max && raw > field.max) fail(path, `${label}: debe ser anterior a ${field.max}.`);
        result = raw;
        break;
      }
      case "number": {
        const n = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
        if (typeof n !== "number" || !Number.isFinite(n)) {
          fail(path, `${label} debe ser un número.`);
          return undefined;
        }
        if (field.min !== undefined && n < field.min) fail(path, `${label}: mínimo ${field.min}.`);
        if (field.max !== undefined && n > field.max) fail(path, `${label}: máximo ${field.max}.`);
        result = n;
        break;
      }
      case "select": {
        if (!field.options.some((o) => o.value === raw)) {
          fail(path, `${label}: opción no válida.`);
          return undefined;
        }
        result = raw;
        break;
      }
      case "toggle":
        result = Boolean(raw);
        break;
      case "color": {
        if (typeof raw !== "string" || !COLOR.test(raw)) {
          fail(path, `${label}: color inválido.`);
          return undefined;
        }
        result = raw.toLowerCase();
        break;
      }
      case "image":
      case "video":
      case "audio":
        result = checkMediaRef(field, raw, path, label);
        break;
      case "images": {
        if (!Array.isArray(raw)) {
          fail(path, `${label} debe ser una lista de fotos.`);
          return [];
        }
        if (field.max && raw.length > field.max) fail(path, `${label}: máximo ${plural(field.max, "foto", "fotos")}.`);
        if (strict && field.min && raw.length < field.min) fail(path, `${label}: agrega al menos ${plural(field.min, "foto", "fotos")}.`);
        const seen = new Set();
        result = raw
          .map((ref, i) => checkMediaRef(field, ref, `${path}.${i}`, `${label} ${i + 1}`))
          .filter((ref) => ref && !seen.has(ref.assetId) && seen.add(ref.assetId));
        break;
      }
      case "group":
        result = walkGroup(field, raw, path, rootValues);
        break;
      case "list": {
        if (!Array.isArray(raw)) {
          fail(path, `${label} debe ser una lista.`);
          return [];
        }
        if (field.max && raw.length > field.max) fail(path, `${label}: máximo ${field.max}.`);
        if (strict && field.min && raw.length < field.min) fail(path, `${label}: agrega al menos ${field.min}.`);
        const itemLabel = field.itemLabel || label;
        result = raw.map((item, i) => walk(field.item, item, `${path}.${i}`, `${itemLabel} ${i + 1}`, rootValues));
        break;
      }
      default:
        fail(path, `${label}: tipo de campo desconocido.`);
        return undefined;
    }

    if (typeof field.validate === "function" && result !== undefined) {
      const message = field.validate(result, { values: rootValues });
      if (message) fail(path, message);
    }
    return result;
  }

  function walkGroup(field, raw, path, rootValues) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      fail(path, `${labelOf(field, path)}: formato inválido.`);
      return {};
    }
    const out = {};
    for (const [key, sub] of Object.entries(field.fields)) {
      const subLabel = field.label && sub.label ? `${field.label} · ${sub.label}` : labelOf(sub, key);
      const v = walk(sub, raw[key], `${path}.${key}`, subLabel, rootValues);
      if (v !== undefined) out[key] = v;
    }
    return out;
  }

  for (const [key, field] of getFieldEntries(schema)) {
    if (!(key in input)) {
      if (strict && field.required && (!allowed || allowed.has(key))) fail(key, `${labelOf(field, key)} es obligatorio.`);
      else if (strict && (field.type === "images" || field.type === "list") && field.min > 0 && (!allowed || allowed.has(key))) {
        fail(key, `${labelOf(field, key)}: agrega al menos ${field.min}.`);
      }
      continue;
    }
    if (allowed && !allowed.has(key)) {
      fail(key, `No puedes modificar "${labelOf(field, key)}".`);
      continue;
    }
    const v = walk(field, input[key], key, labelOf(field, key), input);
    if (v !== undefined) value[key] = v;
  }

  if (allowed) {
    for (const key of Object.keys(input)) {
      if (!schema.fields[key]) fail(key, `Campo no permitido: ${key}.`);
    }
  }

  return { valid: errors.length === 0, errors, value };
}

/** Todas las referencias { assetId } presentes en el contenido, según el schema. */
export function collectAssetIds(schema, content = {}) {
  const ids = new Set();
  function walk(field, value) {
    if (value === null || value === undefined) return;
    switch (field.type) {
      case "image":
      case "video":
      case "audio":
        if (typeof value?.assetId === "string") ids.add(value.assetId);
        break;
      case "images":
        if (Array.isArray(value)) value.forEach((ref) => typeof ref?.assetId === "string" && ids.add(ref.assetId));
        break;
      case "group":
        Object.entries(field.fields).forEach(([k, sub]) => walk(sub, value[k]));
        break;
      case "list":
        if (Array.isArray(value)) value.forEach((item) => walk(field.item, item));
        break;
      default:
    }
  }
  for (const [key, field] of getFieldEntries(schema)) walk(field, content[key]);
  return [...ids];
}
