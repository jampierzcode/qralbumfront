// Genera medios de demostración propios (sin derechos de terceros) para las plantillas.
// Se ejecuta una vez y los resultados se versionan en src/templates/_demo-media/.
// Requiere: sharp (se toma de ../qralbumback/node_modules) y lame (mp3).
//   node scripts/generate-demo-media.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../../qralbumback/package.json"));
const sharp = require("sharp");
const OUT = path.join(here, "../src/templates/_demo-media");
fs.mkdirSync(OUT, { recursive: true });

const rand = (() => {
  let seed = 42;
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
})();

function bokeh(count, w, h, colors, rMin, rMax, opacity = 0.5) {
  return Array.from({ length: count }, () => {
    const r = rMin + rand() * (rMax - rMin);
    const c = colors[Math.floor(rand() * colors.length)];
    return `<circle cx="${(rand() * w).toFixed(0)}" cy="${(rand() * h).toFixed(0)}" r="${r.toFixed(0)}" fill="${c}" opacity="${(opacity * (0.4 + rand() * 0.6)).toFixed(2)}"/>`;
  }).join("");
}

function sunflower(cx, cy, r) {
  const petals = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 360) / 16;
    return `<ellipse cx="${cx}" cy="${cy - r * 0.9}" rx="${r * 0.28}" ry="${r * 0.62}" fill="url(#petal)" transform="rotate(${a} ${cx} ${cy})"/>`;
  }).join("");
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="#5a3515"/><circle cx="${cx}" cy="${cy}" r="${r * 0.38}" fill="#3b220d" opacity=".7"/>`;
}

const W = 1200;
const H = 1500;

const scenes = {
  // Atardecer frente al mar
  "sunset": `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1d4a"/><stop offset=".45" stop-color="#e2607a"/><stop offset=".62" stop-color="#ffb35c"/></linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f08a5d"/><stop offset="1" stop-color="#1d2447"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="600" cy="880" r="170" fill="#ffe7a3" filter="url(#b)"/>
    <circle cx="600" cy="880" r="130" fill="#fff1c9"/>
    <rect y="930" width="${W}" height="${H - 930}" fill="url(#sea)"/>
    ${Array.from({ length: 18 }, (_, i) => `<rect x="${600 - (140 - i * 6)}" y="${950 + i * 26}" width="${(140 - i * 6) * 2}" height="6" rx="3" fill="#ffe2a8" opacity="${(0.7 - i * 0.035).toFixed(2)}"/>`).join("")}
    <g fill="#140d24" opacity=".9"><circle cx="540" cy="1245" r="22"/><rect x="522" y="1265" width="36" height="120" rx="16"/><circle cx="640" cy="1250" r="20"/><rect x="624" y="1268" width="32" height="112" rx="15"/><rect x="552" y="1300" width="84" height="12" rx="6"/></g>`,

  // Campo de girasoles
  "sunflowers": `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb8e6"/><stop offset="1" stop-color="#fde7b0"/></linearGradient>
      <radialGradient id="petal"><stop offset="0" stop-color="#ffd23f"/><stop offset="1" stop-color="#f29e1f"/></radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <rect y="760" width="${W}" height="${H - 760}" fill="#4c7a2c"/>
    <g filter="url(#b)" opacity=".85">${Array.from({ length: 22 }, () => sunflower(rand() * W, 780 + rand() * 160, 26 + rand() * 18)).join("")}</g>
    ${Array.from({ length: 9 }, () => { const x = rand() * W; const y = 950 + rand() * 420; const r = 70 + rand() * 70; return `<rect x="${x - 6}" y="${y}" width="12" height="${H - y}" fill="#2f5a1a"/>${sunflower(x, y, r)}`; }).join("")}`,

  // Luces de ciudad de noche
  "city-lights": `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d1330"/><stop offset="1" stop-color="#3a1840"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)">${bokeh(70, W, H, ["#ffcf6e", "#ff7aa8", "#7ad3ff", "#fff2c2"], 20, 90, 0.75)}</g>
    <g fill="#05070f" opacity=".92"><path d="M0 1500V1180h90v-90h70v130h60v-210h110v170h80v-120h90v220h100v-160h120v110h90v-240h120v300h90v-150h100v-60h80v500z"/></g>`,

  // Café para dos
  "coffee": `
    <defs>
      <radialGradient id="wood" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#b98555"/><stop offset="1" stop-color="#5c3a22"/></radialGradient>
      <radialGradient id="coffee"><stop offset="0" stop-color="#c78b58"/><stop offset=".8" stop-color="#6d3f1f"/></radialGradient>
      <filter id="s"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#wood)"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect y="${i * 110}" width="${W}" height="3" fill="#3f2715" opacity=".25"/>`).join("")}
    ${[[400, 620], [800, 900]].map(([x, y]) => `
      <ellipse cx="${x + 20}" cy="${y + 30}" rx="230" ry="230" fill="#000" opacity=".35" filter="url(#s)"/>
      <circle cx="${x}" cy="${y}" r="220" fill="#f6efe6"/><circle cx="${x}" cy="${y}" r="150" fill="#ece2d6"/>
      <circle cx="${x}" cy="${y}" r="120" fill="url(#coffee)"/>
      <path d="M${x} ${y + 55} C ${x - 90} ${y - 5}, ${x - 55} ${y - 85}, ${x} ${y - 35} C ${x + 55} ${y - 85}, ${x + 90} ${y - 5}, ${x} ${y + 55} Z" fill="#f3dcc0"/>
      <rect x="${x + 200}" y="${y - 30}" width="80" height="60" rx="30" fill="#f6efe6"/>`).join("")}`,

  // Montañas al amanecer
  "mountains": `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6a5"/><stop offset=".6" stop-color="#ffadad"/><stop offset="1" stop-color="#bdb2ff"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="820" cy="520" r="120" fill="#fff5d6" opacity=".9"/>
    <path d="M0 900 L220 640 L420 820 L640 560 L900 860 L1200 620 V1500 H0Z" fill="#9d8ec7"/>
    <path d="M0 1040 L260 780 L520 1000 L760 760 L1000 980 L1200 850 V1500 H0Z" fill="#6e5fa3"/>
    <path d="M0 1200 L300 980 L600 1180 L900 960 L1200 1160 V1500 H0Z" fill="#43397a"/>
    <path d="M0 1350 L350 1180 L700 1340 L1200 1200 V1500 H0Z" fill="#2a2150"/>`,

  // Noche estrellada sobre la colina
  "stars": `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050818"/><stop offset=".7" stop-color="#1c2a5c"/><stop offset="1" stop-color="#3b3f7a"/></linearGradient>
      <filter id="g"><feGaussianBlur stdDeviation="2.5"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <g filter="url(#g)">${bokeh(220, W, 1100, ["#ffffff", "#fff3c4", "#cfe0ff"], 1.5, 5, 1)}</g>
    <path d="M-50 1500 C 250 1150, 700 1120, 1250 1300 V1500Z" fill="#0a0d1f"/>
    <g fill="#0a0d1f"><circle cx="560" cy="1135" r="20"/><rect x="544" y="1152" width="32" height="70" rx="14"/><circle cx="615" cy="1140" r="18"/><rect x="600" y="1156" width="30" height="66" rx="13"/></g>`,

  // Flores de cerezo
  "blossoms": `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde2e4"/><stop offset="1" stop-color="#cddafd"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="10"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)">${bokeh(40, W, H, ["#ffc8dd", "#ffafcc", "#ffffff"], 30, 110, 0.6)}</g>
    <path d="M-40 380 C 300 420, 520 600, 760 560 S 1100 700, 1260 640" stroke="#5b3a29" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M420 520 C 480 700, 460 860, 560 980" stroke="#5b3a29" stroke-width="14" fill="none" stroke-linecap="round"/>
    ${Array.from({ length: 46 }, () => { const x = 60 + rand() * 1120; const y = 330 + rand() * 700; const r = 18 + rand() * 20; return Array.from({ length: 5 }, (_, i) => `<ellipse cx="${x}" cy="${y - r * 0.8}" rx="${r * 0.55}" ry="${r * 0.85}" fill="#ffb7c9" transform="rotate(${i * 72} ${x} ${y})"/>`).join("") + `<circle cx="${x}" cy="${y}" r="${r * 0.3}" fill="#e05780"/>`; }).join("")}`,

  // Playa y olas
  "beach": `
    <defs>
      <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d9b1"/><stop offset="1" stop-color="#e2b77f"/></linearGradient>
      <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b8aa6"/><stop offset="1" stop-color="#6cd4d8"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sand)"/>
    <path d="M0 0 H1200 V520 C 950 600, 800 470, 560 560 S 180 520, 0 600Z" fill="url(#sea)"/>
    <path d="M0 600 C 180 520, 320 580, 560 560 S 950 600, 1200 520" stroke="#ffffff" stroke-width="26" fill="none" opacity=".85"/>
    ${Array.from({ length: 8 }, (_, i) => { const x = 380 + (i % 2) * 90 + i * 40; const y = 760 + i * 95; return `<ellipse cx="${x}" cy="${y}" rx="26" ry="40" fill="#c99a62" opacity=".6" transform="rotate(${-12 + (i % 2) * 24} ${x} ${y})"/>`; }).join("")}
    <path d="M760 1180 C 720 1120, 640 1140, 660 1210 C 675 1260, 760 1300, 760 1300 C 760 1300, 845 1260, 860 1210 C 880 1140, 800 1120, 760 1180Z" fill="none" stroke="#b07f4a" stroke-width="10" opacity=".7"/>`,
};

// Escenas de cumpleaños (se agregan al final para no alterar las anteriores).
Object.assign(scenes, {
  // Pastel con velas encendidas
  cake: `
    <defs>
      <radialGradient id="bg" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#5a3322"/><stop offset=".6" stop-color="#22120c"/><stop offset="1" stop-color="#0e0806"/></radialGradient>
      <radialGradient id="flame" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffc24a"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
      <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4ec"/><stop offset="1" stop-color="#f3d6c7"/></linearGradient>
      <linearGradient id="sponge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0b9a8"/><stop offset="1" stop-color="#c77f6e"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="22"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)" opacity=".6">${bokeh(18, W, 700, ["#ffb347", "#ffd27a", "#ff8f5a"], 20, 70, 0.7)}</g>
    <ellipse cx="600" cy="1290" rx="470" ry="70" fill="#000" opacity=".45"/>
    <rect x="200" y="880" width="800" height="380" rx="40" fill="url(#sponge)"/>
    <path d="M200 920 Q 260 1010 320 930 T 440 930 T 560 930 T 680 930 T 800 930 T 920 930 T 1000 920 V880 H200Z" fill="url(#frost)"/>
    <rect x="200" y="840" width="800" height="90" rx="40" fill="url(#frost)"/>
    ${[330, 450, 600, 750, 870].map((x, i) => `
      <rect x="${x - 14}" y="${620 + (i % 2) * 30}" width="28" height="${230 - (i % 2) * 30}" rx="8" fill="${["#f7c948", "#ef8fb1", "#8fd0f7", "#ef8fb1", "#f7c948"][i]}"/>
      <rect x="${x - 14}" y="${660 + (i % 2) * 30}" width="28" height="14" fill="#fff" opacity=".6"/>
      <ellipse cx="${x}" cy="${585 + (i % 2) * 30}" rx="70" ry="90" fill="url(#flame)" opacity=".55"/>
      <path d="M${x} ${545 + (i % 2) * 30} C ${x + 22} ${580 + (i % 2) * 30}, ${x + 16} ${612 + (i % 2) * 30}, ${x} ${615 + (i % 2) * 30} C ${x - 16} ${612 + (i % 2) * 30}, ${x - 22} ${580 + (i % 2) * 30}, ${x} ${545 + (i % 2) * 30}Z" fill="#ffe28a"/>`).join("")}
    ${Array.from({ length: 26 }, () => `<circle cx="${230 + rand() * 740}" cy="${960 + rand() * 260}" r="${4 + rand() * 5}" fill="${["#f7c948", "#ef5a8a", "#6ec6ff", "#9b7bff"][Math.floor(rand() * 4)]}"/>`).join("")}`,

  // Globos dorados y malva
  balloons: `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d2b"/><stop offset="1" stop-color="#140d15"/></linearGradient>
      <radialGradient id="gold" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff1c2"/><stop offset=".35" stop-color="#e2b25a"/><stop offset="1" stop-color="#7a5320"/></radialGradient>
      <radialGradient id="mauve" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#f3dde6"/><stop offset=".4" stop-color="#b98ba0"/><stop offset="1" stop-color="#5b3b4a"/></radialGradient>
      <radialGradient id="dark" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#8a8290"/><stop offset=".4" stop-color="#3b3640"/><stop offset="1" stop-color="#141116"/></radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)">${bokeh(90, W, H, ["#f7d98a", "#ffffff"], 1.5, 4, 0.9)}</g>
    ${[[320, 560, 230, "gold"], [760, 470, 250, "mauve"], [560, 860, 210, "dark"], [920, 900, 190, "gold"], [230, 1040, 180, "mauve"]].map(([x, y, r, g]) => `
      <path d="M${x} ${y + r * 1.15} C ${x - 40} ${y + r * 1.8}, ${x + 50} ${y + r * 2.3}, ${x - 10} ${H}" stroke="#d9c2a0" stroke-width="3" fill="none" opacity=".6"/>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="url(#${g})"/>
      <path d="M${x - 18} ${y + r * 1.13} L${x + 18} ${y + r * 1.13} L${x} ${y + r * 1.22}Z" fill="#7a5320"/>
      <ellipse cx="${x - r * 0.38}" cy="${y - r * 0.45}" rx="${r * 0.16}" ry="${r * 0.28}" fill="#fff" opacity=".35" transform="rotate(-25 ${x - r * 0.38} ${y - r * 0.45})"/>`).join("")}`,

  // Fiesta con luces y bengalas
  party: `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb877"/><stop offset=".45" stop-color="#e46a6a"/><stop offset="1" stop-color="#40254a"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)">${bokeh(40, W, 900, ["#fff2c4", "#ffd27a", "#ff9fb2"], 16, 60, 0.8)}</g>
    <path d="M0 260 Q 300 360 600 260 T 1200 260" stroke="#3b2430" stroke-width="3" fill="none"/>
    ${Array.from({ length: 13 }, (_, i) => `<circle cx="${i * 100}" cy="${285 + Math.sin(i * 0.9) * 22}" r="16" fill="${["#fff3b0", "#ffd27a", "#ffb3c7"][i % 3]}"/>`).join("")}
    <g fill="#241425">
      ${[180, 360, 560, 760, 960].map((x, i) => `<circle cx="${x}" cy="${1010 - (i % 2) * 40}" r="62"/><path d="M${x - 110} 1500 C ${x - 110} 1180, ${x - 70} ${1090 - (i % 2) * 40}, ${x} ${1090 - (i % 2) * 40} S ${x + 110} 1180, ${x + 110} 1500Z"/>`).join("")}
      <path d="M338 1000 L300 820" stroke="#241425" stroke-width="20" stroke-linecap="round"/>
      <path d="M780 960 L830 780" stroke="#241425" stroke-width="20" stroke-linecap="round"/>
    </g>
    ${[[300, 800], [834, 760]].map(([x, y]) => Array.from({ length: 16 }, (_, k) => { const a = (k / 16) * Math.PI * 2; return `<line x1="${x}" y1="${y}" x2="${x + Math.cos(a) * 60}" y2="${y + Math.sin(a) * 60}" stroke="#fff4c2" stroke-width="3" stroke-linecap="round"/>`; }).join("") + `<circle cx="${x}" cy="${y}" r="16" fill="#fffbe6"/>`).join("")}`,

  // Caja de regalo
  gift: `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe3ff"/><stop offset="1" stop-color="#7aa7f0"/></linearGradient>
      <linearGradient id="box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b8b"/><stop offset="1" stop-color="#d23e63"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${Array.from({ length: 60 }, () => `<rect x="${rand() * W}" y="${rand() * H}" width="12" height="22" rx="3" fill="${["#ffd84d", "#ffffff", "#ff6b8b", "#6be3a4"][Math.floor(rand() * 4)]}" transform="rotate(${rand() * 180} ${rand() * W} ${rand() * H})" opacity=".85"/>`).join("")}
    <ellipse cx="600" cy="1240" rx="380" ry="50" fill="#1d3a73" opacity=".25"/>
    <rect x="280" y="760" width="640" height="470" rx="26" fill="url(#box)"/>
    <rect x="240" y="640" width="720" height="150" rx="24" fill="#ff8aa5"/>
    <rect x="555" y="640" width="90" height="590" fill="#ffd84d"/>
    <path d="M600 640 C 470 470, 330 560, 430 640Z" fill="#ffd84d"/><path d="M600 640 C 730 470, 870 560, 770 640Z" fill="#ffd84d"/>
    <circle cx="600" cy="630" r="36" fill="#f2b705"/>`,

  // Retrato ilustrado de un niño "héroe" (para demos de invitación infantil)
  kid: `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb3ff"/><stop offset="1" stop-color="#c9ecff"/></linearGradient>
      <radialGradient id="skin" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffd8b8"/><stop offset="1" stop-color="#e9a985"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${Array.from({ length: 7 }, (_, i) => `<ellipse cx="${100 + i * 190}" cy="${220 + (i % 3) * 90}" rx="120" ry="44" fill="#fff" opacity=".8"/>`).join("")}
    <path d="M250 1500 C 170 1180, 330 1010, 600 1010 S 1030 1180, 950 1500Z" fill="#e63946"/>
    <path d="M330 1500 C 300 1230, 420 1080, 600 1080 S 900 1230, 870 1500Z" fill="#1d4ed8"/>
    <path d="M600 1150 L650 1250 L760 1260 L675 1330 L700 1440 L600 1380 L500 1440 L525 1330 L440 1260 L550 1250Z" fill="#ffd166"/>
    <rect x="545" y="940" width="110" height="110" rx="40" fill="url(#skin)"/>
    <circle cx="600" cy="700" r="300" fill="url(#skin)"/>
    <circle cx="300" cy="730" r="56" fill="#e9a985"/><circle cx="900" cy="730" r="56" fill="#e9a985"/>
    <path d="M300 640 C 280 380, 480 300, 620 330 C 760 300, 930 420, 900 640 C 860 520, 760 470, 700 520 C 650 440, 520 450, 470 520 C 420 470, 330 520, 300 640Z" fill="#4a2c1d"/>
    <path d="M300 600 C 380 560, 500 520, 900 600 L900 640 C 500 580, 380 620, 300 660Z" fill="#e63946"/>
    <ellipse cx="480" cy="700" rx="42" ry="52" fill="#fff"/><ellipse cx="720" cy="700" rx="42" ry="52" fill="#fff"/>
    <circle cx="488" cy="712" r="26" fill="#3b2418"/><circle cx="712" cy="712" r="26" fill="#3b2418"/>
    <circle cx="496" cy="702" r="9" fill="#fff"/><circle cx="720" cy="702" r="9" fill="#fff"/>
    <path d="M430 630 Q 480 600 530 628" stroke="#4a2c1d" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="M670 628 Q 720 600 770 630" stroke="#4a2c1d" stroke-width="14" fill="none" stroke-linecap="round"/>
    <circle cx="420" cy="820" r="40" fill="#ff8fa3" opacity=".45"/><circle cx="780" cy="820" r="40" fill="#ff8fa3" opacity=".45"/>
    <path d="M480 840 Q 600 960 720 840 Q 600 900 480 840Z" fill="#7a2230"/>
    <path d="M510 852 Q 600 880 690 852 Q 690 870 600 885 Q 510 870 510 852Z" fill="#fff"/>`,
});

const manifest = {};
for (const [name, body] of Object.entries(scenes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
  const file = path.join(OUT, `${name}.webp`);
  const info = await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(file);
  const tiny = await sharp(Buffer.from(svg)).resize(24).webp({ quality: 40 }).toBuffer();
  manifest[name] = { width: info.width, height: info.height, placeholder: `data:image/webp;base64,${tiny.toString("base64")}` };
  console.log(`✓ ${name}.webp ${(info.size / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(path.join(OUT, "photos.json"), JSON.stringify(manifest, null, 2));

// ── Melodía de caja musical (composición propia) ─────────────────────────────
const RATE = 44100;
const BPM = 76;
const beat = 60 / BPM;
const n = (semi) => 440 * 2 ** ((semi - 9) / 12); // semi relativo a Do4
const progression = [
  [0, 4, 7, 12], // Do
  [-5, 2, 7, 11], // Sol/Si
  [-3, 0, 4, 9], // Lam
  [-7, 0, 5, 9], // Fa
];
const pattern = [0, 1, 2, 3, 2, 1, 2, 3];
const melody = [16, 14, 12, 14, 16, 16, 16, null, 14, 14, 14, null, 16, 19, 19, null];
const bars = 8;
const seconds = bars * 4 * beat + 2;
const samples = new Float32Array(Math.ceil(seconds * RATE));

function pluck(freq, start, dur, gain) {
  const s0 = Math.floor(start * RATE);
  const len = Math.floor(dur * RATE);
  for (let i = 0; i < len && s0 + i < samples.length; i++) {
    const t = i / RATE;
    const env = Math.exp(-3.2 * t) * Math.min(1, t * 400);
    samples[s0 + i] += gain * env * (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t) + 0.08 * Math.sin(6 * Math.PI * freq * t));
  }
}

for (let bar = 0; bar < bars; bar++) {
  const chord = progression[bar % 4];
  for (let step = 0; step < 8; step++) {
    pluck(n(chord[pattern[step]] + 12), bar * 4 * beat + step * (beat / 2), 1.6, 0.16);
  }
  pluck(n(chord[0] - 12), bar * 4 * beat, 3, 0.12);
  if (bar >= 2) {
    const note = melody[(bar * 4 + (bar % 2) * 3) % melody.length];
    for (let q = 0; q < 4; q++) {
      const m = melody[(bar * 4 + q) % melody.length];
      if (m !== null) pluck(n(m + 12), bar * 4 * beat + q * beat, 1.8, 0.11);
    }
    void note;
  }
}
// Eco suave
const delay = Math.floor(0.36 * RATE);
for (let i = delay; i < samples.length; i++) samples[i] += samples[i - delay] * 0.32;
let peak = 0;
for (const s of samples) peak = Math.max(peak, Math.abs(s));
const pcm = Buffer.alloc(44 + samples.length * 2);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + samples.length * 2, 4); pcm.write("WAVE", 8); pcm.write("fmt ", 12);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(RATE, 24);
pcm.writeUInt32LE(RATE * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36);
pcm.writeUInt32LE(samples.length * 2, 40);
samples.forEach((s, i) => pcm.writeInt16LE(Math.round((s / peak) * 0.85 * 32767), 44 + i * 2));
const wav = path.join(OUT, "music-box.wav");
fs.writeFileSync(wav, pcm);
execFileSync("lame", ["--quiet", "-V", "5", "-m", "m", wav, path.join(OUT, "music-box.mp3")]);
fs.unlinkSync(wav);
console.log(`✓ music-box.mp3 ${(fs.statSync(path.join(OUT, "music-box.mp3")).size / 1024).toFixed(0)} KB (${seconds.toFixed(1)} s)`);
