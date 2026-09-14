// Smoke test responsive de TODAS las plantillas con Chrome del sistema (playwright-core).
// Requiere el servidor corriendo (npm run dev + API).
//
//   npm run smoke                       → todas las plantillas (demo)
//   npm run smoke -- yellow-flowers     → una plantilla
//   SMOKE_SLUG=abc123 npm run smoke     → además un regalo publicado real
//   SMOKE_BASE=http://localhost:3000    → servidor a probar
//
// Verifica en 375×812, 390×844, 844×390, 768×1024 y 1440×900:
//   · sin errores de consola ni excepciones
//   · sin audio antes del gesto del usuario
//   · sin scroll horizontal
//   · la experiencia se abre con el gesto (botón del shell o de la plantilla)
// Capturas en artifacts/smoke/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.SMOKE_BASE || "http://localhost:3000";
const OUT = path.join(root, "..", "artifacts", "smoke");
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "375x812", width: 375, height: 812, mobile: true },
  { name: "390x844", width: 390, height: 844, mobile: true },
  { name: "844x390", width: 844, height: 390, mobile: true },
  { name: "768x1024", width: 768, height: 1024, mobile: true },
  { name: "1440x900", width: 1440, height: 900, mobile: false },
];

const templatesDir = path.join(root, "..", "src", "templates");
const allTemplates = fs
  .readdirSync(templatesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name);
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const targets = (only.length ? only : allTemplates).map((id) => ({ label: id, url: `${BASE}/demo/${id}` }));
if (process.env.SMOKE_SLUG) targets.push({ label: `gift-${process.env.SMOKE_SLUG}`, url: `${BASE}/g/${process.env.SMOKE_SLUG}` });

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--autoplay-policy=user-gesture-required"] });
const failures = [];

for (const target of targets) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const problems = [];
    page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => problems.push(`excepción: ${e.message}`));

    try {
      await page.goto(target.url, { waitUntil: "networkidle", timeout: 30000 });
      const playingBefore = await page.evaluate(() => [...document.querySelectorAll("audio,video")].some((m) => !m.paused));
      if (playingBefore) problems.push("reproduce audio/video antes del gesto");

      const gate = page.locator(".gs-gate__button, [data-gift-open]").first();
      if (await gate.count()) {
        await gate.click();
      } else {
        problems.push("no se encontró el elemento para abrir la experiencia (.gs-gate__button o [data-gift-open])");
      }
      await page.waitForTimeout(3500);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) problems.push(`scroll horizontal de ${overflow}px`);

      await page.screenshot({ path: path.join(OUT, `${target.label}-${vp.name}.png`) });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT, `${target.label}-${vp.name}-end.png`) });
    } catch (error) {
      problems.push(`no cargó: ${error.message.split("\n")[0]}`);
    }

    const ok = problems.length === 0;
    console.log(`${ok ? "✓" : "✗"} ${target.label} ${vp.name}${ok ? "" : `\n    - ${problems.join("\n    - ")}`}`);
    if (!ok) failures.push({ target: target.label, viewport: vp.name, problems });
    await context.close();
  }
}

await browser.close();
console.log(`\nCapturas: ${path.relative(process.cwd(), OUT)}`);
if (failures.length) {
  console.error(`\n${failures.length} combinación(es) con problemas.`);
  process.exit(1);
}
console.log("Todo OK.");
