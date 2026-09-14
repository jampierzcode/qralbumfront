// Contrato que TODA plantilla debe cumplir. Agregar una carpeta nueva la incluye sola.
import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listTemplates } from "../engine/registry.js";
import { getCustomerEditableKeys, getSteps, prepareContent, validateContent, FIELD_TYPES } from "../../gift-core/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const folders = fs
  .readdirSync(here, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name);

describe("registro", () => {
  test("todas las carpetas de plantillas quedan registradas", () => {
    expect(listTemplates().map((t) => t.manifest.id).sort()).toEqual(folders.sort());
  });
});

describe.each(listTemplates().map((t) => [t.manifest.id, t]))("%s", (id, template) => {
  const { manifest, schema, demo } = template;

  test("manifest completo", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.description.length).toBeGreaterThan(10);
    expect(manifest.occasions.length).toBeGreaterThan(0);
    expect(["shell", "template"]).toContain(manifest.gate);
    if (manifest.soundtrack) expect(schema.fields[manifest.soundtrack]?.type).toBe("audio");
  });

  test("schema: tipos válidos, etiquetas y pasos", () => {
    for (const [key, field] of Object.entries(schema.fields)) {
      expect(FIELD_TYPES).toContain(field.type);
      expect(field.label, `${key} sin label`).toBeTruthy();
    }
    expect(getSteps(schema).length).toBeGreaterThan(0);
  });

  test("el comprador tiene al menos un paso para completar en el portal", () => {
    const keys = getCustomerEditableKeys(schema);
    expect(getSteps(schema, { keys }).length).toBeGreaterThan(0);
  });

  test("el demo pasa la validación de publicación", () => {
    const values = { ...demo.gift.content, recipientName: demo.gift.recipientName, senderName: demo.gift.senderName };
    const assets = Object.fromEntries(Object.entries(demo.media).map(([assetId, a]) => [assetId, { kind: a.kind }]));
    const result = validateContent(schema, values, { mode: "publish", assets });
    expect(result.errors).toEqual([]);
  });

  test("prepareContent resuelve toda la media del demo", () => {
    const prepared = prepareContent(schema, demo.gift, demo.media);
    for (const [key, field] of Object.entries(schema.fields)) {
      if (field.type === "images") expect(prepared[key].every((img) => img.src && img.width)).toBe(true);
      if (field.type === "audio" && demo.gift.content[key]) expect(prepared[key].src).toBeTruthy();
    }
  });

  test("carpeta con archivos obligatorios", () => {
    for (const file of ["index.js", "manifest.js", "schema.js", "demo.js", "Experience.jsx"]) {
      expect(fs.existsSync(path.join(here, id, file)), `${id}/${file}`).toBe(true);
    }
  });
});
