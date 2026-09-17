// Prepara las ilustraciones de bebé de la plantilla baby-shower:
// las deja en webp (900 px, calidad 82) y guarda su tamaño y placeholder.
//   node scripts/baby-shower-media.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(root, "../../qralbumback/package.json"));
const sharp = require("sharp");

const OUT = path.join(root, "..", "src", "templates", "baby-shower", "media");
const SOURCES = {
  "baby-boy": process.env.HOME + "/Downloads/modelo baby boy.png",
  "baby-girl": process.env.HOME + "/Downloads/baby girl.png",
};

fs.mkdirSync(OUT, { recursive: true });
const manifest = {};
for (const [name, src] of Object.entries(SOURCES)) {
  const file = path.join(OUT, `${name}.webp`);
  const info = await sharp(src).resize(900, 900, { fit: "inside" }).webp({ quality: 82 }).toFile(file);
  const tiny = await sharp(src).resize(24).webp({ quality: 40 }).toBuffer();
  manifest[name] = { width: info.width, height: info.height, placeholder: `data:image/webp;base64,${tiny.toString("base64")}` };
  console.log(`✓ ${name}.webp ${(info.size / 1024).toFixed(0)} KB · ${info.width}×${info.height}`);
}
fs.writeFileSync(path.join(OUT, "babies.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("✓ babies.json");
