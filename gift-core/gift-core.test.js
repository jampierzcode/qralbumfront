import { describe, expect, test } from "vitest";
import {
  f,
  defineSchema,
  getSteps,
  getDefaults,
  getCustomerEditableKeys,
  validateContent,
  prepareContent,
  collectAssetIds,
  splitBoundValues,
  mergeBoundValues,
  defineManifest,
} from "./index.js";

const schema = defineSchema({
  version: 1,
  steps: [
    { id: "who", title: "¿Para quién es?" },
    { id: "story", title: "La historia" },
    { id: "media", title: "Fotos y música" },
  ],
  fields: {
    recipientName: f.text({ label: "Nombre", required: true, max: 40, editorStep: "who" }),
    senderName: f.text({ label: "De parte de", editorStep: "who" }),
    message: f.textarea({ label: "Mensaje", max: 50, editorStep: "story", default: "Te quiero" }),
    metOn: f.date({ label: "Fecha", editorStep: "story", max: "2030-01-01" }),
    years: f.number({ label: "Años", min: 1, max: 99, editorStep: "story" }),
    mood: f.select({ label: "Tono", options: ["romántico", { value: "divertido", label: "Divertido" }], editorStep: "story" }),
    showCounter: f.toggle({ label: "Contador", editorStep: "story" }),
    accent: f.color({ label: "Color", editorStep: "story", default: "#ffcc00" }),
    cover: f.image({ label: "Portada", editorStep: "media", customerEditable: false }),
    photos: f.images({ label: "Fotos", min: 2, max: 3, editorStep: "media" }),
    song: f.audio({ label: "Canción", editorStep: "media" }),
    chapters: f.list({
      label: "Capítulos",
      itemLabel: "Capítulo",
      min: 1,
      max: 2,
      editorStep: "story",
      item: f.group({
        fields: {
          title: f.text({ label: "Título", required: true }),
          photo: f.image({ label: "Foto" }),
        },
      }),
    }),
    reasons: f.list({ label: "Razones", item: f.text({ max: 10 }), max: 3 }),
    secret: f.text({ label: "Clave", validate: (v) => (v && v !== "amor" ? "La clave es incorrecta." : undefined) }),
  },
});

const assets = {
  a1: { kind: "image", variants: { thumb: { url: "/m/a1/t.webp", width: 480 }, md: { url: "/m/a1/md.webp", width: 1080 }, lg: { url: "/m/a1/lg.webp", width: 2048, height: 1365 } }, width: 2048, height: 1365, placeholder: "data:x", originalName: "IMG_4938.JPG" },
  a2: { kind: "image", url: "https://legacy.example.com/foto.jpg" },
  s1: { kind: "audio", url: "/m/s1/source.mp3", durationSec: 180 },
};

describe("defineSchema", () => {
  test("rechaza tipos inválidos, pasos no declarados y min > max", () => {
    expect(() => defineSchema({ fields: { x: { type: "raro" } } })).toThrow(/tipo inválido/);
    expect(() => defineSchema({ fields: { x: f.text({ editorStep: "nope" }) } })).toThrow(/no está declarado/);
    expect(() => defineSchema({ fields: { x: f.images({ min: 5, max: 2 }) } })).toThrow(/min no puede/);
    expect(() => f.list({})).toThrow(/item/);
  });

  test("agrupa campos por pasos y descarta pasos vacíos", () => {
    const steps = getSteps(schema);
    expect(steps.map((s) => s.id)).toEqual(["who", "story", "media", "content"]);
    expect(steps[0].fields.map(([k]) => k)).toEqual(["recipientName", "senderName"]);
    const portal = getSteps(schema, { keys: ["photos", "song"] });
    expect(portal.map((s) => s.id)).toEqual(["media"]);
  });

  test("claves editables por el comprador excluyen customerEditable:false", () => {
    expect(getCustomerEditableKeys(schema)).not.toContain("cover");
    expect(getCustomerEditableKeys(schema)).toContain("photos");
  });

  test("defaults", () => {
    const d = getDefaults(schema);
    expect(d.message).toBe("Te quiero");
    expect(d.photos).toEqual([]);
    expect(d.showCounter).toBe(false);
    expect(d.accent).toBe("#ffcc00");
  });
});

describe("validateContent", () => {
  test("modo borrador acepta contenido incompleto pero valida forma y máximos", () => {
    const ok = validateContent(schema, { recipientName: "" }, { mode: "draft" });
    expect(ok.valid).toBe(true);

    const bad = validateContent(schema, { message: "x".repeat(51), years: "abc", metOn: "2024-02-30", accent: "rojo" });
    expect(bad.valid).toBe(false);
    const paths = bad.errors.map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["message", "years", "metOn", "accent"]));
    expect(bad.errors.find((e) => e.path === "message").message).toMatch(/máximo 50 caracteres/);
  });

  test("modo publicar exige obligatorios y mínimos con mensajes humanos", () => {
    const res = validateContent(schema, { photos: [{ assetId: "a1" }], chapters: [{ title: " " }] }, { mode: "publish" });
    const byPath = Object.fromEntries(res.errors.map((e) => [e.path, e.message]));
    expect(byPath.recipientName).toBe("Nombre es obligatorio.");
    expect(byPath.photos).toMatch(/al menos 2 fotos/);
    expect(byPath["chapters.0.title"]).toMatch(/Título es obligatorio/);
  });

  test("valida referencias de media contra los assets del regalo", () => {
    const res = validateContent(
      schema,
      { photos: [{ assetId: "a1" }, { assetId: "s1" }, { assetId: "zz" }], song: { assetId: "a2" } },
      { assets }
    );
    const messages = res.errors.map((e) => e.message).join(" | ");
    expect(messages).toMatch(/Fotos 2: tipo de archivo incorrecto/);
    expect(messages).toMatch(/Fotos 3: el archivo ya no existe/);
    expect(messages).toMatch(/Canción: tipo de archivo incorrecto/);
  });

  test("sanea: quita claves desconocidas, duplica fotos y normaliza números/colores", () => {
    const res = validateContent(schema, {
      hacker: "<script>",
      years: "5",
      accent: "#FFAA00",
      photos: [{ assetId: "a1", evil: true }, { assetId: "a1" }],
    });
    expect(res.value).not.toHaveProperty("hacker");
    expect(res.value.years).toBe(5);
    expect(res.value.accent).toBe("#ffaa00");
    expect(res.value.photos).toEqual([{ assetId: "a1" }]);
  });

  test("restricción de claves (portal): rechaza campos no permitidos", () => {
    const res = validateContent(schema, { photos: [], cover: { assetId: "a1" }, extra: 1 }, { keys: ["photos"] });
    const paths = res.errors.map((e) => e.path);
    expect(paths).toContain("cover");
    expect(paths).toContain("extra");
  });

  test("listas: máximo y elementos de texto", () => {
    const res = validateContent(schema, { reasons: ["corto", "demasiado largo", "ok", "x"] });
    const messages = res.errors.map((e) => e.message);
    expect(messages).toContain("Razones: máximo 3.");
    expect(messages.some((m) => m.startsWith("Elemento 2: máximo 10"))).toBe(true);
  });

  test("validación personalizada del campo", () => {
    expect(validateContent(schema, { secret: "odio" }).errors[0].message).toBe("La clave es incorrecta.");
    expect(validateContent(schema, { secret: "amor" }).valid).toBe(true);
  });
});

describe("prepareContent", () => {
  test("resuelve media, aplica defaults, inyecta nombres y nunca expone nombres de archivo", () => {
    const prepared = prepareContent(
      schema,
      {
        recipientName: " Sofía ",
        content: { photos: [{ assetId: "a1" }, { assetId: "a2" }, { assetId: "borrado" }], song: { assetId: "s1" }, chapters: [{ title: "Inicio" }] },
      },
      assets
    );
    expect(prepared.recipientName).toBe("Sofía");
    expect(prepared.message).toBe("Te quiero");
    expect(prepared.photos).toHaveLength(2);
    expect(prepared.photos[0]).toMatchObject({ src: "/m/a1/md.webp", width: 2048, height: 1365, placeholder: "data:x" });
    expect(prepared.photos[0].srcSet).toContain("/m/a1/lg.webp 2048w");
    expect(prepared.photos[1].src).toBe("https://legacy.example.com/foto.jpg");
    expect(prepared.song).toMatchObject({ kind: "audio", src: "/m/s1/source.mp3", duration: 180 });
    expect(prepared.chapters[0]).toEqual({ title: "Inicio", photo: null });
    expect(JSON.stringify(prepared)).not.toContain("IMG_4938");
  });
});

describe("utilidades", () => {
  test("collectAssetIds recorre grupos y listas", () => {
    const ids = collectAssetIds(schema, {
      photos: [{ assetId: "a1" }],
      song: { assetId: "s1" },
      chapters: [{ title: "x", photo: { assetId: "c1" } }],
    });
    expect(ids.sort()).toEqual(["a1", "c1", "s1"]);
  });

  test("split/merge de nombres enlazados al Gift", () => {
    const { content, bound } = splitBoundValues({ recipientName: "Ana", message: "hola" });
    expect(content).toEqual({ message: "hola" });
    expect(bound).toEqual({ recipientName: "Ana" });
    expect(mergeBoundValues({ message: "hola" }, { recipientName: "Ana", senderName: "Leo" })).toEqual({
      message: "hola",
      recipientName: "Ana",
      senderName: "Leo",
    });
  });

  test("defineManifest valida id y completa valores por defecto", () => {
    expect(() => defineManifest({ id: "Mal Id", name: "x" })).toThrow();
    const m = defineManifest({ id: "love-letter", name: "Carta" });
    expect(m.gate).toBe("shell");
    expect(m.version).toBe(1);
  });
});
