import { getFieldEntries, BOUND_KEYS } from "./schema.js";

const IMAGE_WIDTHS = { thumb: 480, md: 1080, lg: 2048 };

/**
 * Convierte un asset (API pública, editor o demo) en lo que consume una plantilla.
 * Nunca expone el nombre original del archivo.
 */
export function resolveAsset(asset) {
  if (!asset) return null;
  const variants = asset.variants || {};
  if (asset.kind === "image") {
    const srcSet = Object.entries(IMAGE_WIDTHS)
      .filter(([name]) => variants[name]?.url)
      .map(([name]) => `${variants[name].url} ${variants[name].width || IMAGE_WIDTHS[name]}w`)
      .join(", ");
    const width = asset.width || variants.lg?.width || null;
    const height = asset.height || variants.lg?.height || null;
    return {
      id: asset.id,
      kind: "image",
      src: variants.md?.url || asset.url || variants.lg?.url || variants.thumb?.url,
      thumbSrc: variants.thumb?.url || asset.thumbUrl || asset.url,
      srcSet: srcSet || undefined,
      width,
      height,
      aspectRatio: width && height ? width / height : null,
      placeholder: asset.placeholder || null,
    };
  }
  return {
    id: asset.id,
    kind: asset.kind,
    src: asset.url || variants.source?.url,
    duration: asset.durationSec || null,
    mimeType: asset.mimeType || null,
  };
}

function prepareField(field, value, media) {
  const lookup = (ref) => (ref && typeof ref.assetId === "string" ? resolveAsset(media[ref.assetId] && { id: ref.assetId, ...media[ref.assetId] }) : null);

  switch (field.type) {
    case "text":
    case "textarea": {
      const text = typeof value === "string" ? value.trim() : "";
      return text || (typeof field.default === "string" ? field.default : "");
    }
    case "image":
    case "video":
    case "audio":
      return lookup(value);
    case "images":
      return (Array.isArray(value) ? value : []).map(lookup).filter(Boolean);
    case "group":
      return Object.fromEntries(
        Object.entries(field.fields).map(([k, sub]) => [k, prepareField(sub, value?.[k], media)])
      );
    case "list":
      return (Array.isArray(value) ? value : []).map((item) => prepareField(field.item, item, media));
    case "toggle":
      return value === undefined || value === null ? Boolean(field.default) : Boolean(value);
    default:
      return value === undefined || value === null || value === "" ? field.default ?? null : value;
  }
}

/**
 * Prepara los datos que recibe una plantilla (`content` en sus props):
 * aplica valores por defecto, inyecta recipientName/senderName desde el Gift
 * y resuelve referencias de media a { src, srcSet, width, height, … }.
 *
 * @param {object} schema
 * @param {{ content?: object, recipientName?: string, senderName?: string }} gift
 * @param {Record<string, object>} media  mapa assetId → asset
 */
export function prepareContent(schema, gift = {}, media = {}) {
  const source = { ...(gift.content || {}) };
  for (const key of BOUND_KEYS) if (gift[key] !== undefined) source[key] = gift[key];

  const prepared = {};
  for (const [key, field] of getFieldEntries(schema)) {
    prepared[key] = prepareField(field, source[key], media);
  }
  for (const key of BOUND_KEYS) {
    if (!(key in prepared)) prepared[key] = typeof source[key] === "string" ? source[key].trim() : "";
  }
  return prepared;
}
