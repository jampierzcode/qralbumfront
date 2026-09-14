// gift-core: contrato compartido entre frontend y backend.
// Reglas: ESM puro, sin dependencias, sin acceso a DOM, red ni base de datos.
export { f, FIELD_TYPES, MEDIA_KIND_BY_TYPE, isMediaField } from "./fields.js";
export {
  defineSchema,
  getFieldEntries,
  getSteps,
  getCustomerEditableKeys,
  getDefaults,
  getItemDefaults,
  splitBoundValues,
  mergeBoundValues,
  BOUND_KEYS,
} from "./schema.js";
export { validateContent, collectAssetIds } from "./validate.js";
export { prepareContent, resolveAsset } from "./prepare.js";
export { defineManifest, GIFT_STATUSES } from "./manifest.js";
