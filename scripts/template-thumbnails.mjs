// Genera src/templates/<id>/thumbnail.webp desde el render REAL del demo.
// Requiere el servidor corriendo (npm run dev) y sharp (se toma de ../qralbumback).
//   npm run templates:thumbnails [-- templateId]
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(root, "../../qralbumback/package.json"));
const sharp = require("sharp");
const BASE = process.env.SMOKE_BASE || "http://localhost:3000";
const templatesDir = path.join(root, "..", "src", "templates");

const ids = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(templatesDir, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("_")).map((d) => d.name);

const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: 480, height: 600 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/demo/${id}?preview=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(Number(process.env.THUMB_DELAY || 4500));
  const png = await page.screenshot();
  const out = path.join(templatesDir, id, "thumbnail.webp");
  // 4:3 recortando la parte superior (donde está la composición principal)
  await sharp(png).resize(960, 720, { fit: "cover", position: "top" }).webp({ quality: 78 }).toFile(out);
  console.log(`✓ ${path.relative(process.cwd(), out)}`);
  await page.close();
}
await browser.close();
