// Genera las ilustraciones de demostración de las tarjetas de político: el candidato
// (fondo transparente, como pide el cliente), cuatro integrantes del equipo y un logo
// de partido INVENTADO. Son dibujos propios: sin rostros reales ni logos de terceros.
//   node scripts/politician-media.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../../qralbumback/package.json"));
const sharp = require("sharp");
const OUT = path.join(here, "../src/templates/_politician-kit/media");
fs.mkdirSync(OUT, { recursive: true });

/** Busto ilustrado en un lienzo de 600×700. */
function person({ skin, shade, hair, style = "short", jacket, lapel, shirt = "#ffffff", tie = null, necklace = false, glasses = false, beard = false }) {
  const backHair =
    style === "long"
      ? `<path d="M168 310C146 176 218 126 300 126s154 50 132 184l10 170H158z" fill="${hair}"/>`
      : style === "bun"
        ? `<circle cx="300" cy="128" r="48" fill="${hair}"/>`
        : "";
  const frontHair =
    style === "long"
      ? `<path d="M188 292C198 204 258 172 300 174c50 0 108 34 114 118-30-52-72-66-114-66s-84 14-112 66z" fill="${hair}"/>`
      : style === "bun"
        ? `<path d="M186 296C186 196 236 156 300 156s114 40 114 140c-14-52-52-76-114-76s-100 24-114 76z" fill="${hair}"/>`
        : `<path d="M186 292C176 190 232 148 300 148s124 42 114 144c-14-44-44-70-114-70s-100 26-114 70z" fill="${hair}"/>`;
  const beardShape = beard
    ? `<path d="M190 322c0 110 60 132 110 132s110-22 110-132c-12 52-52 70-110 70s-98-18-110-70z" fill="${hair}" opacity=".92"/>`
    : "";
  return `
    ${backHair}
    <path d="M40 700C40 560 130 500 240 482h120c110 18 200 78 200 218z" fill="${jacket}"/>
    <path d="M256 396h88v100c-22 22-66 22-88 0z" fill="${shade}"/>
    <path d="M240 482 300 610 360 482z" fill="${shirt}"/>
    <path d="M240 482 300 610 232 640 176 520zM360 482 300 610 368 640 424 520z" fill="${lapel}"/>
    ${tie ? `<path d="M284 506h32l-6 20 12 96-22 22-22-22 12-96z" fill="${tie}"/>` : ""}
    ${necklace ? `<path d="M262 520q38 48 76 0" fill="none" stroke="#f2c14e" stroke-width="7" stroke-linecap="round"/>` : ""}
    <ellipse cx="188" cy="312" rx="19" ry="31" fill="${skin}"/>
    <ellipse cx="412" cy="312" rx="19" ry="31" fill="${skin}"/>
    <ellipse cx="300" cy="300" rx="114" ry="136" fill="${skin}"/>
    ${beardShape}
    ${frontHair}
    <path d="M240 268q16-14 34-4M326 264q18-10 34 4" fill="none" stroke="${hair}" stroke-width="9" stroke-linecap="round"/>
    <circle cx="256" cy="304" r="10" fill="#241a17"/>
    <circle cx="344" cy="304" r="10" fill="#241a17"/>
    <circle cx="259" cy="300" r="3.2" fill="#fff"/>
    <circle cx="347" cy="300" r="3.2" fill="#fff"/>
    ${glasses ? `<g fill="none" stroke="#2a2a30" stroke-width="7"><rect x="222" y="276" width="70" height="56" rx="18"/><rect x="308" y="276" width="70" height="56" rx="18"/><path d="M292 300h16M222 298l-28-8M378 298l28-8"/></g>` : ""}
    <path d="M300 312q-10 30-2 42 8 6 16 0" fill="none" stroke="${shade}" stroke-width="6" stroke-linecap="round"/>
    <path d="M258 372q42 42 84 0q-42 12-84 0z" fill="#fff" stroke="#7a2e2e" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="226" cy="356" r="16" fill="#e8807a" opacity=".22"/>
    <circle cx="374" cy="356" r="16" fill="#e8807a" opacity=".22"/>`;
}

const svg = (w, h, body, viewBox = `0 0 ${w} ${h}`) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${viewBox}">${body}</svg>`;

const people = {
  candidate: person({ skin: "#dfa981", shade: "#c78d66", hair: "#2a1b14", jacket: "#1c2a4a", lapel: "#152039", tie: "#d6352f", glasses: true }),
  "team-1": person({ skin: "#f0c7a4", shade: "#d9a97f", hair: "#5a3420", style: "long", jacket: "#7a2f5e", lapel: "#5e2148", shirt: "#f7efe8", necklace: true }),
  "team-2": person({ skin: "#b9805a", shade: "#a06a47", hair: "#1b1410", jacket: "#2d4a3e", lapel: "#213a30", tie: "#f2c14e", beard: true }),
  "team-3": person({ skin: "#e6b48d", shade: "#cf9a72", hair: "#7d3b1e", style: "bun", jacket: "#35507a", lapel: "#283e60", shirt: "#f7efe8" }),
  "team-4": person({ skin: "#8f5a3c", shade: "#794a30", hair: "#120d0b", jacket: "#5b5f68", lapel: "#44474f", tie: "#2f6fd6" }),
};

const bgs = { "team-1": ["#ffd8c2", "#ffb199"], "team-2": ["#cfe8dc", "#9ed1bb"], "team-3": ["#d3e0f5", "#a9c3ec"], "team-4": ["#fde9b5", "#f6cf72"] };

const partyLogo = svg(
  600,
  600,
  `<defs>
     <clipPath id="disc"><circle cx="300" cy="300" r="250"/></clipPath>
     <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a63d8"/><stop offset="1" stop-color="#0a3a94"/></linearGradient>
   </defs>
   <circle cx="300" cy="300" r="288" fill="#ffffff"/>
   <circle cx="300" cy="300" r="270" fill="#0a3a94"/>
   <g clip-path="url(#disc)">
     <rect width="600" height="600" fill="url(#sky)"/>
     <g stroke="#ffb300" stroke-width="16" stroke-linecap="round">
       ${Array.from({ length: 9 }, (_, i) => {
         const a = Math.PI + (i * Math.PI) / 8;
         return `<path d="M${300 + Math.cos(a) * 128} ${372 + Math.sin(a) * 128}L${300 + Math.cos(a) * 196} ${372 + Math.sin(a) * 196}"/>`;
       }).join("")}
     </g>
     <path d="M172 372a128 128 0 0 1 256 0z" fill="#ffb300"/>
     <rect y="372" width="600" height="60" fill="#ffffff"/>
     <rect y="432" width="600" height="60" fill="#d6352f"/>
     <rect y="492" width="600" height="80" fill="#ffffff"/>
   </g>
   <circle cx="300" cy="300" r="250" fill="none" stroke="#ffffff" stroke-width="10"/>`
);

const jobs = [
  ["candidate.webp", svg(900, 1050, people.candidate, "20 47 560 653"), 900, 1050],
  ...["team-1", "team-2", "team-3", "team-4"].map((id) => [
    `${id}.webp`,
    svg(
      600,
      600,
      `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bgs[id][0]}"/><stop offset="1" stop-color="${bgs[id][1]}"/></linearGradient></defs>
       <rect width="600" height="600" fill="url(#bg)"/>${people[id]}`,
      "0 90 600 600"
    ),
    600,
    600,
  ]),
  ["party-logo.webp", partyLogo, 600, 600],
];

const manifest = {};
for (const [file, source, width, height] of jobs) {
  const png = await sharp(Buffer.from(source)).resize(width, height, { fit: "fill" }).png().toBuffer();
  const info = await sharp(png).webp({ quality: 86, alphaQuality: 100 }).toFile(path.join(OUT, file));
  const tiny = await sharp(png).resize(24).webp({ quality: 40 }).toBuffer();
  const name = file.replace(".webp", "");
  manifest[name] = { width: info.width, height: info.height, placeholder: `data:image/webp;base64,${tiny.toString("base64")}` };
  console.log(`✓ ${file} ${(info.size / 1024).toFixed(0)} KB · ${info.width}×${info.height}`);
}
fs.writeFileSync(path.join(OUT, "politicians.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log("✓ politicians.json");
