// Pruebas del kit de político. Cada diseño nuevo hereda estas garantías porque usa politicianSchema().
import { describe, expect, test } from "vitest";
import { getCustomerEditableKeys, getSteps, prepareContent, validateContent } from "../../../gift-core/index.js";
import { politicianManifest, politicianSchema } from "./fields.js";
import { politicianDemo } from "./demo.js";
import { campaignList, contrastColor, contrastRatio, daysUntil, formatCampaignDate, formatVoteDate, mixHex, readableOnLight, visibleOn, votingCountdownText } from "./format.js";
import { isBoxedPhoto } from "./useCutout.js";
import { NETWORKS, checkLink, linkHref, linkLabel } from "./networks.js";

const schema = politicianSchema();
const demo = politicianDemo();
const assets = Object.fromEntries(Object.entries(demo.media).map(([assetId, a]) => [assetId, { kind: a.kind }]));
const values = () => structuredClone({ ...demo.gift.content, recipientName: demo.gift.recipientName });
const publish = (v, extra = {}) => validateContent(schema, v, { mode: "publish", assets, ...extra });

describe("schema", () => {
  test("el demo pasa la validación de publicación", () => {
    expect(publish(values()).errors).toEqual([]);
  });

  test("prepareContent resuelve fotos, logo, equipo y portadas", () => {
    const c = prepareContent(schema, demo.gift, demo.media);
    expect(c.photo.src).toBeTruthy();
    expect(c.partyLogo.src).toBeTruthy();
    expect(c.team.every((m) => m.photo.src && m.name && m.role)).toBe(true);
    expect(c.campaign.cover.src).toBeTruthy();
    expect(c.history.every((h) => h.kind === "past")).toBe(true);
    expect(c.colorPrimary).toBe("#0b57d0");
  });

  test("los colores por defecto los pone cada diseño", () => {
    const other = prepareContent(politicianSchema({ primary: "#c0392b", accent: "#111111" }), { recipientName: "X", content: {} }, {});
    expect(other.colorPrimary).toBe("#c0392b");
    expect(other.colorAccent).toBe("#111111");
  });

  test("faltan los datos que definen una candidatura", () => {
    const v = values();
    delete v.photo;
    v.office = "";
    v.ballotNumber = "";
    const paths = publish(v).errors.map((e) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["photo", "office", "ballotNumber"]));
  });

  test("el número de votación admite ceros a la izquierda y rechaza letras", () => {
    const ok = values();
    ok.ballotNumber = "08";
    expect(publish(ok).value.ballotNumber).toBe("08");
    const bad = values();
    bad.ballotNumber = "8A";
    expect(publish(bad).errors.map((e) => e.path)).toContain("ballotNumber");
  });
});

describe("quién edita qué", () => {
  test("el cliente NO puede editar el historial de campañas; la campaña única sí", () => {
    const keys = getCustomerEditableKeys(schema);
    expect(keys).not.toContain("history");
    expect(keys).toContain("campaign");
  });

  test("el portal rechaza que el cliente modifique el historial", () => {
    const keys = getCustomerEditableKeys(schema);
    const result = validateContent(schema, { history: [{ kind: "past", title: "Colada" }] }, { keys });
    expect(result.valid).toBe(false);
    expect(result.errors[0].path).toBe("history");
  });

  test("el paso del historial sólo aparece para el superadmin", () => {
    const keys = getCustomerEditableKeys(schema);
    expect(getSteps(schema).map((s) => s.id)).toContain("history");
    expect(getSteps(schema, { keys }).map((s) => s.id)).not.toContain("history");
  });

  test("el superadmin puede agregar varias campañas (hasta 30)", () => {
    const v = values();
    v.history = Array.from({ length: 30 }, (_, i) => ({ kind: "past", title: `Campaña ${i + 1}` }));
    expect(publish(v).errors).toEqual([]);
    v.history.push({ kind: "past", title: "Una más" });
    expect(publish(v).errors.map((e) => e.path)).toContain("history");
  });
});

describe("links personalizados", () => {
  test("cada red valida a su manera", () => {
    expect(checkLink({ network: "facebook", url: "https://facebook.com/x" })).toBeUndefined();
    expect(checkLink({ network: "facebook", url: "facebook.com/x" })).toMatch(/https/);
    expect(checkLink({ network: "whatsapp-group", url: "https://chat.whatsapp.com/AbC123" })).toBeUndefined();
    expect(checkLink({ network: "whatsapp-group", url: "https://facebook.com/x" })).toMatch(/grupo/i);
    expect(checkLink({ network: "whatsapp", url: "+51 987 654 321" })).toBeUndefined();
    expect(checkLink({ network: "phone", url: "abc" })).toBeTruthy();
    expect(checkLink({ network: "email", url: "hola@partido.pe" })).toBeUndefined();
    expect(checkLink({ network: "email", url: "hola" })).toBeTruthy();
  });

  test("nunca genera un href peligroso", () => {
    expect(linkHref({ network: "web", url: "javascript:alert(1)" })).toBe("");
    expect(linkHref({ network: "other", url: "data:text/html,<script>" })).toBe("");
    expect(linkHref({ network: "web", url: "http://inseguro.com" })).toBe("");
  });

  test("arma los href de cada red", () => {
    expect(linkHref({ network: "whatsapp", url: "+51 987 654 321" })).toBe("https://wa.me/51987654321");
    expect(linkHref({ network: "phone", url: "+51 987 654 321" })).toBe("tel:+51987654321");
    expect(linkHref({ network: "email", url: "hola@partido.pe" })).toBe("mailto:hola@partido.pe");
    expect(linkHref({ network: "instagram", url: "https://instagram.com/x" })).toBe("https://instagram.com/x");
  });

  test("la etiqueta vacía usa la sugerida de la red", () => {
    expect(linkLabel({ network: "facebook", label: "" })).toBe("Fanpage");
    expect(linkLabel({ network: "facebook", label: "Mi página" })).toBe("Mi página");
    expect(linkLabel({ network: "whatsapp-group" })).toBe("Únete al grupo de WhatsApp");
  });

  test("el schema rechaza un link inválido para su red", () => {
    const v = values();
    v.links = [{ network: "whatsapp-group", label: "Grupo", url: "https://facebook.com/x" }];
    expect(publish(v).errors.map((e) => e.path)).toContain("links.0");
    v.links = [{ network: "facebook", label: "", url: "" }];
    expect(publish(v).errors.map((e) => e.path)).toContain("links.0.url");
  });

  test("todas las redes tienen etiqueta sugerida", () => {
    expect(NETWORKS.every((n) => n.value && n.label && n.tag)).toBe(true);
  });
});

describe("campañas y cuenta regresiva", () => {
  const now = new Date(2026, 8, 21, 10, 0);
  const day = (n) => {
    const d = new Date(2026, 8, 21 + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  test("daysUntil cuenta días de calendario", () => {
    expect(daysUntil(day(0), now)).toBe(0);
    expect(daysUntil(day(5), now)).toBe(5);
    expect(daysUntil(day(-2), now)).toBe(-2);
    expect(daysUntil("", now)).toBeNull();
  });

  test("el texto de la cuenta regresiva", () => {
    expect(votingCountdownText(5)).toBe("Faltan 5 días");
    expect(votingCountdownText(1)).toBe("¡Mañana se vota!");
    expect(votingCountdownText(0)).toBe("¡Hoy se vota!");
    expect(votingCountdownText(-1)).toBe("");
    expect(votingCountdownText(null)).toBe("");
  });

  test("junta la campaña del cliente con el historial: próximas primero, realizadas de más reciente a más antigua", () => {
    const { upcoming, past } = campaignList(
      {
        campaign: { kind: "upcoming", title: "Caminata", date: day(9) },
        history: [
          { kind: "past", title: "Vieja", date: day(-80) },
          { kind: "upcoming", title: "Pronto", date: day(2) },
          { kind: "past", title: "Reciente", date: day(-3) },
          { kind: "past", title: "Sin fecha" },
        ],
      },
      now
    );
    expect(upcoming.map((c) => c.title)).toEqual(["Pronto", "Caminata"]);
    expect(past.map((c) => c.title)).toEqual(["Reciente", "Vieja", "Sin fecha"]);
  });

  test("una 'próxima' que ya pasó se muestra como realizada", () => {
    const { upcoming, past } = campaignList({ campaign: { kind: "upcoming", title: "Olvidada", date: day(-4) } }, now);
    expect(upcoming).toEqual([]);
    expect(past[0].title).toBe("Olvidada");
  });

  test("ignora campañas vacías (el grupo del cliente nace con un tipo por defecto)", () => {
    const { upcoming, past } = campaignList({ campaign: { kind: "upcoming", title: null, description: "", cover: null }, history: [] }, now);
    expect(upcoming).toEqual([]);
    expect(past).toEqual([]);
  });
});

describe("manifest base", () => {
  test("abre directo (sin 'toca para abrir'), sin música y en la colección Política", () => {
    const manifest = politicianManifest({ id: "politico-prueba", name: "Prueba", description: "Tarjeta de prueba." });
    expect(manifest.gate).toBe("template");
    expect(manifest.supportsMusic).toBe(false);
    expect(manifest.defaultCollections).toEqual(["politica"]);
  });
});

describe("colores del partido: siempre legibles", () => {
  test("contrastColor elige blanco sobre oscuros y oscuro sobre claros", () => {
    expect(contrastColor("#0b57d0")).toBe("#ffffff");
    expect(contrastColor("#f5c400")).toBe("#111827");
    expect(contrastColor("#ffffff")).toBe("#111827");
    expect(contrastColor("#000000")).toBe("#ffffff");
    expect(contrastColor("no-es-color")).toBe("#ffffff");
  });

  test("readableOnLight oscurece un amarillo hasta poder leerse sobre blanco y no toca un azul oscuro", () => {
    expect(contrastRatio("#f5c400", "#ffffff")).toBeLessThan(2);
    expect(contrastRatio(readableOnLight("#f5c400"), "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(readableOnLight("#0b57d0")).toBe("#0b57d0");
    expect(readableOnLight("basura")).toBe("basura");
  });

  test("visibleOn cae a blanco cuando el acento se pierde sobre el fondo", () => {
    const deep = mixHex("#f5c400", "#000000", 0.5);
    expect(visibleOn("#c8102e", deep)).toBe("#ffffff");
    expect(visibleOn("#ffb300", mixHex("#0b57d0", "#000000", 0.5))).toBe("#ffb300");
  });

  test("mixHex mezcla los extremos", () => {
    expect(mixHex("#ffffff", "#000000", 0)).toBe("#ffffff");
    expect(mixHex("#ffffff", "#000000", 1)).toBe("#000000");
    expect(mixHex("#ff0000", "#0000ff", 0.5)).toBe("#800080");
  });
});

describe("foto del candidato y fechas cortas", () => {
  test("una foto con esquinas opacas es rectangular; con esquinas transparentes es un recorte", () => {
    expect(isBoxedPhoto([255, 255, 255, 255])).toBe(true);
    expect(isBoxedPhoto([0, 0, 0, 0])).toBe(false);
    expect(isBoxedPhoto([255, 255, 0, 255])).toBe(false);
    expect(isBoxedPhoto([])).toBe(false);
  });

  test("formatos cortos con el año sólo si no es el actual", () => {
    const now = new Date(2026, 8, 21);
    expect(formatVoteDate("2026-10-21", now)).toBe("Miércoles 21 de octubre");
    expect(formatVoteDate("2027-04-11", now)).toBe("Domingo 11 de abril de 2027");
    expect(formatCampaignDate("2026-09-30", now)).toBe("Mié 30 Sep");
    expect(formatCampaignDate("2025-09-01", now)).toBe("Lun 1 Sep 2025");
    expect(formatVoteDate("", now)).toBe("");
  });
});
