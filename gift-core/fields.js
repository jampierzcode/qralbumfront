// DSL de campos de plantillas.
// ESM puro y SIN dependencias: lo usan el frontend (editor, portal, plantillas)
// y el backend (validación) a partir del MISMO archivo schema.js de cada plantilla.

export const FIELD_TYPES = Object.freeze([
  "text",
  "textarea",
  "date",
  "number",
  "select",
  "toggle",
  "color",
  "image",
  "images",
  "video",
  "audio",
  "group",
  "list",
]);

export const MEDIA_KIND_BY_TYPE = Object.freeze({ image: "image", images: "image", video: "video", audio: "audio" });

/**
 * Propiedades comunes a todos los campos.
 * @typedef {Object} FieldOptions
 * @property {string}  [label]            Etiqueta visible en el editor.
 * @property {string}  [description]      Ayuda corta debajo de la etiqueta.
 * @property {string}  [placeholder]
 * @property {boolean} [required]         Obligatorio para publicar / enviar.
 * @property {number}  [min]              texto: largo mínimo · número: valor · images/list: cantidad.
 * @property {number}  [max]              texto: largo máximo · número: valor · images/list: cantidad.
 * @property {*}       [default]          Valor por defecto (editor y experiencia).
 * @property {(value:any, ctx:{values:object}) => (string|undefined)} [validate] Validación extra.
 * @property {string}  [editorStep]       id del paso del editor/portal donde aparece.
 * @property {boolean} [customerEditable] Si el comprador puede completarlo en el portal (true por defecto).
 * @property {string}  [portalLabel]      Etiqueta alternativa, más cercana, para el portal del comprador.
 * @property {string}  [portalDescription]
 */

const BASE = Object.freeze({
  label: "",
  description: "",
  placeholder: "",
  required: false,
  editorStep: null,
  customerEditable: true,
});

function normalizeOptions(options = []) {
  return options.map((o) => (typeof o === "object" ? { value: o.value, label: o.label ?? String(o.value) } : { value: o, label: String(o) }));
}

function make(type, defaults = {}) {
  return (options = {}) => {
    const field = { ...BASE, ...defaults, ...options, type };
    if (type === "select") field.options = normalizeOptions(field.options);
    return Object.freeze(field);
  };
}

export const f = Object.freeze({
  /** Texto de una línea. `max` = caracteres (120 por defecto). */
  text: make("text", { max: 120 }),
  /** Texto largo. `rows` = alto del control. */
  textarea: make("textarea", { max: 2000, rows: 4 }),
  /** Fecha `YYYY-MM-DD`. `min`/`max` también en `YYYY-MM-DD`. */
  date: make("date"),
  number: make("number", { step: 1 }),
  /** `options`: ["a","b"] o [{ value, label }]. */
  select: make("select", { options: [] }),
  toggle: make("toggle", { default: false }),
  /** Color hexadecimal `#rrggbb`. */
  color: make("color"),
  /** Una imagen: `{ assetId }`. */
  image: make("image"),
  /** Varias imágenes ordenables: `[{ assetId }]`. `min`/`max` = cantidad. */
  images: make("images", { min: 0, max: 12 }),
  video: make("video"),
  /** Canción / audio: `{ assetId }`. */
  audio: make("audio"),
  /** Objeto con subcampos. `fields`: { clave: campo }. */
  group: (options = {}) => {
    if (!options.fields || typeof options.fields !== "object") throw new Error("f.group necesita `fields`.");
    return Object.freeze({ ...BASE, ...options, type: "group", fields: Object.freeze({ ...options.fields }) });
  },
  /** Lista repetible. `item`: campo (normalmente f.group). `itemLabel`: "Capítulo". */
  list: (options = {}) => {
    if (!options.item || !options.item.type) throw new Error("f.list necesita `item`.");
    return Object.freeze({ ...BASE, min: 0, max: 20, itemLabel: "Elemento", ...options, type: "list" });
  },
});

export function isMediaField(field) {
  return Boolean(MEDIA_KIND_BY_TYPE[field.type]);
}
