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

// ── Bodas ───────────────────────────────────────────────────────────────────
// Ramita de eucalipto: tallo curvo con hojas alternadas que se achican hacia la punta.
function sprig(x, y, len, angle, { color = "#93ab8c", dark = "#6f8a6c", leaf = 26, count = 7, curve = 0.3 } = {}) {
  const a = (angle * Math.PI) / 180;
  const ex = x + Math.cos(a) * len;
  const ey = y + Math.sin(a) * len;
  const qx = x + Math.cos(a) * len * 0.5 - Math.sin(a) * len * curve;
  const qy = y + Math.sin(a) * len * 0.5 + Math.cos(a) * len * curve;
  const at = (t) => [
    (1 - t) ** 2 * x + 2 * (1 - t) * t * qx + t ** 2 * ex,
    (1 - t) ** 2 * y + 2 * (1 - t) * t * qy + t ** 2 * ey,
  ];
  const n = (v) => v.toFixed(0);
  let out = `<path d="M${x} ${y} Q ${n(qx)} ${n(qy)} ${n(ex)} ${n(ey)}" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const [px, py] = at(t);
    const [fx, fy] = at(Math.min(1, t + 0.06));
    const [bx, by] = at(Math.max(0, t - 0.06));
    const dl = Math.hypot(fx - bx, fy - by) || 1;
    const side = i % 2 ? 1 : -1;
    const size = leaf * (1 - t * 0.35);
    const ox = (-(fy - by) / dl) * side * size * 0.9;
    const oy = ((fx - bx) / dl) * side * size * 0.9;
    const rot = (Math.atan2(oy, ox) * 180) / Math.PI + 90;
    out += `<ellipse cx="${n(px + ox)}" cy="${n(py + oy)}" rx="${n(size * 0.66)}" ry="${n(size)}" fill="${i % 2 ? color : dark}" transform="rotate(${n(rot)} ${n(px + ox)} ${n(py + oy)})"/>`;
  }
  return `${out}<ellipse cx="${n(ex)}" cy="${n(ey)}" rx="${n(leaf * 0.42)}" ry="${n(leaf * 0.7)}" fill="${color}" transform="rotate(${angle} ${n(ex)} ${n(ey)})"/>`;
}

// Rosa abierta vista de frente (pétalos en espiral).
function rose(cx, cy, r, light, mid, dark) {
  const n = (v) => v.toFixed(0);
  const ring = (count, dist, size, fill, offset) =>
    Array.from({ length: count }, (_, i) => `<ellipse cx="${cx}" cy="${n(cy - r * dist)}" rx="${n(r * size * 0.94)}" ry="${n(r * size)}" fill="${fill}" transform="rotate(${i * (360 / count) + offset} ${cx} ${cy})"/>`).join("");
  return `<circle cx="${cx}" cy="${cy}" r="${n(r)}" fill="${mid}"/>${ring(6, 0.56, 0.44, mid, 0)}${ring(6, 0.52, 0.42, light, 30)}${ring(5, 0.32, 0.3, mid, 12)}${ring(5, 0.28, 0.27, light, 48)}<circle cx="${cx}" cy="${cy}" r="${n(r * 0.24)}" fill="${light}"/><path d="M${n(cx)} ${n(cy - r * 0.2)} A ${n(r * 0.2)} ${n(r * 0.2)} 0 1 1 ${n(cx - r * 0.14)} ${n(cy + r * 0.14)}" fill="none" stroke="${dark}" stroke-width="${n(Math.max(2, r * 0.07))}" opacity=".45" stroke-linecap="round"/>`;
}

// Flor de acuarela de 5 pétalos (las azules de la invitación de noche).
function bloom(cx, cy, r, petal, edge, heart) {
  const petals = Array.from({ length: 5 }, (_, i) => `<ellipse cx="${cx}" cy="${(cy - r * 0.62).toFixed(0)}" rx="${(r * 0.52).toFixed(0)}" ry="${(r * 0.72).toFixed(0)}" fill="${i % 2 ? petal : edge}" transform="rotate(${i * 72 + (cx % 17)} ${cx} ${cy})"/>`).join("");
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${(r * 0.26).toFixed(0)}" fill="${heart}"/>`;
}

// Escenas de boda (se agregan al final para no alterar las anteriores).
Object.assign(scenes, {
  // Los novios frente a frente en la hora dorada
  couple: `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7dcae"/><stop offset=".45" stop-color="#eda87c"/><stop offset="1" stop-color="#7a5460"/></linearGradient>
      <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7dd"/><stop offset="1" stop-color="#ffd79a" stop-opacity="0"/></radialGradient>
      <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf1"/><stop offset="1" stop-color="#e6d6bf"/></linearGradient>
      <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#303853"/><stop offset="1" stop-color="#141929"/></linearGradient>
      <radialGradient id="skin" cx=".4" cy=".32" r=".8"><stop offset="0" stop-color="#f6cfae"/><stop offset="1" stop-color="#d59f7c"/></radialGradient>
      <radialGradient id="vig" cx=".5" cy=".42" r=".78"><stop offset=".55" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#43222a" stop-opacity=".55"/></radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="26"/></filter>
      <filter id="s"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="600" cy="800" r="330" fill="url(#sun)"/>
    <g filter="url(#b)" opacity=".75">${bokeh(24, W, 1150, ["#ffe9b8", "#ffc38a", "#fff4d8"], 26, 95, 0.7)}</g>
    <path d="M0 1160 C 250 1105, 430 1150, 650 1105 S 1010 1125, 1200 1075 V1500 H0Z" fill="#6b4650" opacity=".5" filter="url(#s)"/>
    <ellipse cx="600" cy="1460" rx="430" ry="60" fill="#3d2129" opacity=".35" filter="url(#s)"/>
    <path d="M690 452 C 566 500, 528 748, 552 1012 C 566 1180, 566 1340, 546 1500 H986 C 950 1260, 930 1010, 906 818 C 878 596, 806 478, 690 452Z" fill="#ffffff" opacity=".26" filter="url(#s)"/>
    <path d="M520 636 C 432 650, 378 720, 362 838 C 346 962, 348 1210, 340 1500 H676 C 664 1200, 656 986, 646 866 C 632 724, 600 652, 520 636Z" fill="url(#suit)"/>
    <path d="M474 664 L520 706 L566 664 L546 642 L520 668 L494 642Z" fill="#faf5ea"/>
    <path d="M520 700 L540 736 L520 776 L500 736Z" fill="#8a2f43"/>
    <circle cx="452" cy="720" r="17" fill="#f6efe2"/><circle cx="452" cy="720" r="9" fill="#c9a24a"/>
    <path d="M690 634 C 766 650, 800 724, 812 846 C 828 1004, 880 1244, 944 1500 H556 C 620 1250, 652 1010, 664 862 C 674 728, 642 652, 690 634Z" fill="url(#dress)"/>
    <path d="M664 862 C 700 900, 780 902, 812 856 C 820 960, 850 1160, 900 1420 C 800 1330, 700 1330, 600 1420 C 640 1180, 660 980, 664 862Z" fill="#ffffff" opacity=".45"/>
    <circle cx="520" cy="548" r="86" fill="url(#skin)"/>
    <circle cx="690" cy="552" r="80" fill="url(#skin)"/>
    <path d="M436 536 C 430 452, 476 404, 530 408 C 588 412, 610 466, 602 540 C 586 486, 530 456, 470 486 C 452 498, 442 514, 436 536Z" fill="#33231a"/>
    <path d="M772 560 C 786 470, 740 414, 684 416 C 620 418, 598 470, 606 552 C 624 496, 668 466, 716 486 C 746 500, 764 522, 772 560Z" fill="#4a3123"/>
    <circle cx="774" cy="600" r="46" fill="#4a3123"/>
    ${sprig(624, 1118, 150, 96, { leaf: 18, count: 5, color: "#7d9678", dark: "#5f7a5c" })}
    ${sprig(586, 1120, 120, 124, { leaf: 15, count: 4, color: "#7d9678", dark: "#5f7a5c" })}
    ${sprig(664, 1120, 120, 58, { leaf: 15, count: 4, color: "#7d9678", dark: "#5f7a5c" })}
    ${rose(624, 1082, 40, "#fffdf8", "#f2e6d2", "#cbb794")}
    ${rose(578, 1110, 28, "#fffdf8", "#efe2cc", "#cbb794")}
    ${rose(670, 1112, 27, "#fffdf8", "#efe2cc", "#cbb794")}
    <path d="M604 1140 C 596 1180, 606 1220, 624 1250 C 642 1220, 652 1180, 644 1140Z" fill="#e8d6bb" opacity=".85"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>`,

  // Las argollas sobre mármol
  rings: `
    <defs>
      <linearGradient id="marble" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfbf7"/><stop offset=".55" stop-color="#f4efe6"/><stop offset="1" stop-color="#e7ded0"/></linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e3ad"/><stop offset=".35" stop-color="#c9a24a"/><stop offset=".62" stop-color="#8d6a24"/><stop offset="1" stop-color="#eed697"/></linearGradient>
      <filter id="v"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="sh"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#marble)"/>
    <g filter="url(#v)" opacity=".35" fill="none" stroke="#b9ad99" stroke-linecap="round">
      <path d="M-40 320 C 240 380, 330 200, 620 300 S 1000 420, 1240 330" stroke-width="7"/>
      <path d="M-40 520 C 200 620, 420 440, 700 560 S 1030 660, 1240 560" stroke-width="4"/>
      <path d="M-40 1120 C 260 1040, 420 1240, 700 1150 S 1020 1040, 1240 1110" stroke-width="6"/>
      <path d="M120 -20 C 180 240, 60 420, 160 660 S 240 980, 150 1240" stroke-width="3"/>
      <path d="M1040 -20 C 980 260, 1120 420, 1030 700 S 960 1040, 1060 1300" stroke-width="4"/>
    </g>
    ${sprig(120, 1290, 330, -48, { leaf: 34, count: 8 })}
    ${sprig(210, 1360, 260, -20, { leaf: 26, count: 7, color: "#8aa483", dark: "#68835f" })}
    ${sprig(1090, 300, 320, 132, { leaf: 32, count: 8 })}
    ${sprig(1010, 230, 240, 160, { leaf: 24, count: 6, color: "#8aa483", dark: "#68835f" })}
    <g filter="url(#sh)" opacity=".3">
      <ellipse cx="540" cy="900" rx="190" ry="42" fill="#a9977c"/>
      <ellipse cx="740" cy="930" rx="165" ry="38" fill="#a9977c"/>
    </g>
    <circle cx="520" cy="740" r="158" fill="none" stroke="url(#gold)" stroke-width="30"/>
    <circle cx="520" cy="740" r="158" fill="none" stroke="#ffffff" stroke-width="6" opacity=".45" stroke-dasharray="90 420" stroke-dashoffset="60"/>
    <circle cx="726" cy="800" r="132" fill="none" stroke="url(#gold)" stroke-width="26"/>
    <circle cx="726" cy="800" r="132" fill="none" stroke="#ffffff" stroke-width="5" opacity=".45" stroke-dasharray="70 360" stroke-dashoffset="40"/>
    <path d="M520 898 A158 158 0 0 0 662 810" fill="none" stroke="url(#gold)" stroke-width="30"/>
    <g transform="translate(520 582)">
      <path d="M0 -62 L34 -18 L0 38 L-34 -18Z" fill="#f2f7ff"/>
      <path d="M0 -62 L34 -18 L0 -6 L-34 -18Z" fill="#ffffff"/>
      <path d="M-34 -18 L0 38 L0 -6Z" fill="#dbe7f7"/>
      <path d="M-14 -40 L14 -40 L22 -18 L-22 -18Z" fill="#ffffff" opacity=".85"/>
      <path d="M-18 -18 L18 -18 L0 -34Z" fill="#c9a24a" opacity=".25"/>
    </g>
    <path d="M498 606 L520 582 L542 606" fill="none" stroke="url(#gold)" stroke-width="12" stroke-linecap="round"/>`,

  // Arco de eucalipto sobre marfil
  greenery: `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfaf4"/><stop offset="1" stop-color="#f1ece1"/></linearGradient>
      <filter id="s"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <ellipse cx="600" cy="820" rx="420" ry="520" fill="none" stroke="#e6e0d2" stroke-width="3"/>
    ${Array.from({ length: 22 }, (_, i) => {
      const t = i / 21;
      const th = Math.PI + t * Math.PI;
      const x = 600 + Math.cos(th) * 400;
      const y = 820 + Math.sin(th) * 500;
      const deg = (th * 180) / Math.PI + 90;
      return sprig(x, y, 150 - Math.abs(t - 0.5) * 60, deg + (i % 2 ? 18 : -18), { leaf: 24 - (i % 3) * 3, count: 5, color: i % 2 ? "#93ab8c" : "#7f9a79", dark: "#63805f" });
    }).join("")}
    ${[[330, 470, 44], [880, 520, 40], [520, 330, 34], [700, 1250, 42], [380, 1180, 34]].map(([x, y, r]) => rose(x, y, r, "#fffdf9", "#f4ead8", "#ddcaa8")).join("")}
    <g filter="url(#s)" opacity=".25"><ellipse cx="600" cy="1400" rx="360" ry="40" fill="#b7ac95"/></g>
    ${Array.from({ length: 16 }, () => `<ellipse cx="${(rand() * W).toFixed(0)}" cy="${(rand() * H).toFixed(0)}" rx="9" ry="16" fill="#9db396" opacity="${(0.25 + rand() * 0.35).toFixed(2)}" transform="rotate(${(rand() * 180).toFixed(0)} ${(rand() * W).toFixed(0)} ${(rand() * H).toFixed(0)})"/>`).join("")}`,

  // Ramo de novia
  bouquet: `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9f0e8"/><stop offset="1" stop-color="#e5cfc4"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="22"/></filter>
      <filter id="s"><feGaussianBlur stdDeviation="12"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)" opacity=".5">${bokeh(22, W, H, ["#ffffff", "#f6dfd2", "#e9d4c4"], 40, 120, 0.7)}</g>
    <g filter="url(#s)" opacity=".28"><ellipse cx="620" cy="1360" rx="250" ry="46" fill="#a08877"/></g>
    ${[[600, 560, -92], [600, 560, -60], [600, 560, -120], [600, 560, -30], [600, 560, -150], [600, 560, -8], [600, 560, -172]].map(([x, y, a], i) => sprig(x, y + 240, 300 + (i % 3) * 60, a, { leaf: 30, count: 7, color: i % 2 ? "#8fa888" : "#7a9574", dark: "#5f7a5c" })).join("")}
    ${[[600, 590, 92], [470, 660, 72], [730, 665, 74], [560, 790, 70], [690, 800, 66], [600, 700, 60], [400, 810, 52], [800, 800, 54]].map(([x, y, r]) => rose(x, y, r, "#fffdf9", "#f3e8d8", "#d9c5a3")).join("")}
    ${[[500, 560, 26], [700, 560, 24], [620, 880, 26], [430, 720, 22], [770, 710, 22]].map(([x, y, r]) => bloom(x, y, r, "#ffffff", "#f0e4d2", "#e0c98f")).join("")}
    <path d="M564 880 C 570 1000, 588 1120, 598 1244 L642 1244 C 650 1120, 662 1000, 664 880Z" fill="#c9b18f"/>
    <path d="M568 946 C 610 982, 620 982, 660 946 C 674 998, 670 1030, 650 1058 C 616 1082, 602 1082, 576 1054 C 558 1028, 556 996, 568 946Z" fill="#f8efe4"/>
    <path d="M574 1048 C 520 1090, 498 1184, 514 1274 C 540 1194, 562 1132, 602 1082Z" fill="#f2e4d6"/>
    <path d="M652 1050 C 708 1094, 728 1186, 710 1276 C 688 1196, 666 1134, 626 1084Z" fill="#f2e4d6"/>`,

  // Acuarelas azules sobre azul noche
  "navy-blooms": `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16274c"/><stop offset=".5" stop-color="#1d3260"/><stop offset="1" stop-color="#0e1a33"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="30"/></filter>
      <filter id="w"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)" opacity=".55">${bokeh(16, W, H, ["#3f63a8", "#5f86c9", "#8fb0e0"], 90, 230, 0.5)}</g>
    <g filter="url(#w)" opacity=".92">
      ${[[190, 250, 78], [330, 150, 58], [120, 430, 54], [300, 380, 66], [430, 280, 44]].map(([x, y, r], i) => bloom(x, y, r, i % 2 ? "#a9c4e8" : "#7c9fd4", "#5d83bb", "#f0e1b4")).join("")}
      ${[[1020, 1230, 80], [880, 1340, 60], [1090, 1030, 56], [930, 1120, 66], [770, 1230, 44]].map(([x, y, r], i) => bloom(x, y, r, i % 2 ? "#a9c4e8" : "#7c9fd4", "#5d83bb", "#f0e1b4")).join("")}
      ${[[980, 320, 62], [1100, 470, 48], [180, 1120, 58], [90, 980, 42]].map(([x, y, r], i) => bloom(x, y, r, i % 2 ? "#cfdff3" : "#93b3de", "#6a8dc4", "#e9d7a6")).join("")}
    </g>
    ${sprig(160, 520, 300, -78, { leaf: 30, count: 7, color: "#6f90c4", dark: "#4d6d9e" })}
    ${sprig(430, 330, 240, -140, { leaf: 24, count: 6, color: "#7fa0d0", dark: "#5676a8" })}
    ${sprig(1030, 980, 300, 100, { leaf: 30, count: 7, color: "#6f90c4", dark: "#4d6d9e" })}
    ${sprig(790, 1230, 240, 40, { leaf: 24, count: 6, color: "#7fa0d0", dark: "#5676a8" })}
    ${Array.from({ length: 70 }, () => `<circle cx="${(rand() * W).toFixed(0)}" cy="${(rand() * H).toFixed(0)}" r="${(1 + rand() * 2.6).toFixed(1)}" fill="#f4e3b6" opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`).join("")}
    <g opacity=".5" fill="none" stroke="#cbb277" stroke-width="2">
      <path d="M600 90 C 520 190, 480 250, 600 330 C 720 250, 680 190, 600 90Z"/>
      <path d="M600 1180 C 520 1280, 480 1340, 600 1420 C 720 1340, 680 1280, 600 1180Z"/>
    </g>`,

  // Altar al aire libre
  altar: `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb7d9"/><stop offset=".45" stop-color="#f4cfa4"/><stop offset="1" stop-color="#f1b184"/></linearGradient>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bab74"/><stop offset="1" stop-color="#6f8253"/></linearGradient>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8a273"/><stop offset=".5" stop-color="#9b7448"/><stop offset="1" stop-color="#7d5b35"/></linearGradient>
      <filter id="b"><feGaussianBlur stdDeviation="16"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="600" cy="700" r="230" fill="#fff0cc" filter="url(#b)" opacity=".85"/>
    <g opacity=".55" fill="#8aa07a">
      ${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${60 + i * 150}" cy="${700 + (i % 3) * 40}" rx="${110 + (i % 4) * 30}" ry="${130 + (i % 3) * 40}"/>`).join("")}
    </g>
    <rect y="820" width="${W}" height="${H - 820}" fill="url(#grass)"/>
    <path d="M600 820 L330 1500 H870Z" fill="#e8dcc2"/>
    <path d="M600 820 L470 1500 H730Z" fill="#f3ead6" opacity=".8"/>
    <g fill="url(#wood)">
      <rect x="352" y="440" width="34" height="470" rx="10"/>
      <rect x="814" y="440" width="34" height="470" rx="10"/>
      <path d="M340 520 C 368 352, 832 352, 860 520 L860 566 C 826 416, 374 416, 374 566Z"/>
    </g>
    <path d="M400 470 C 420 620, 386 760, 420 900 C 470 800, 470 640, 452 470Z" fill="#fbf6ec" opacity=".95"/>
    <path d="M800 470 C 780 620, 814 760, 780 900 C 730 800, 730 640, 748 470Z" fill="#fbf6ec" opacity=".95"/>
    ${sprig(372, 470, 210, -118, { leaf: 26, count: 6 })}
    ${sprig(828, 470, 210, -62, { leaf: 26, count: 6 })}
    ${[[380, 430, 34], [820, 430, 32], [600, 366, 30], [340, 520, 26], [862, 516, 24]].map(([x, y, r]) => rose(x, y, r, "#fffdf8", "#f4e9d8", "#ddcaa8")).join("")}
    ${[0, 1, 2, 3].map((row) => {
      const y = 1070 + row * 116;
      const spread = 285 + row * 118;
      const w = 70 + row * 12;
      const back = 74 + row * 10;
      return [-1, 1].map((side) => {
        const x = 600 + side * spread;
        return `<g opacity=".96">
          <rect x="${x - w / 2}" y="${y}" width="${w}" height="${13 + row * 2}" rx="6" fill="#f7f1e4"/>
          <rect x="${x - w / 2 + 6}" y="${y - back}" width="${w - 12}" height="${back + 4}" rx="16" fill="none" stroke="#f7f1e4" stroke-width="${8 + row}"/>
          <rect x="${x - w / 2 + 3}" y="${y + 11 + row * 2}" width="8" height="${36 + row * 8}" rx="4" fill="#efe6d4"/>
          <rect x="${x + w / 2 - 11}" y="${y + 11 + row * 2}" width="8" height="${36 + row * 8}" rx="4" fill="#efe6d4"/>
          <path d="M${x} ${y - back + 8} c -18 -14, -34 6, -14 16 l 14 6 l 14 -6 c 20 -10, 4 -30, -14 -16Z" fill="#e7d9c2"/>
        </g>`;
      }).join("");
    }).join("")}
    ${Array.from({ length: 34 }, () => `<ellipse cx="${(420 + rand() * 380).toFixed(0)}" cy="${(1080 + rand() * 400).toFixed(0)}" rx="12" ry="8" fill="${["#f6dfe6", "#fbeef0", "#eecdd8"][Math.floor(rand() * 3)]}" transform="rotate(${(rand() * 180).toFixed(0)} 600 1200)" opacity=".9"/>`).join("")}`,

  // El primer baile bajo las luces
  dance: `
    <defs>
      <radialGradient id="bg" cx=".5" cy=".62" r=".85"><stop offset="0" stop-color="#3d2b46"/><stop offset=".6" stop-color="#1b1428"/><stop offset="1" stop-color="#0c0814"/></radialGradient>
      <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="20"/></filter>
      <filter id="s"><feGaussianBlur stdDeviation="9"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#b)" opacity=".8">${bokeh(46, W, 1050, ["#ffd48a", "#ffe9bd", "#ffba6a"], 16, 70, 0.8)}</g>
    ${[210, 330, 450].map((y, row) => {
      const bulbs = Array.from({ length: 12 }, (_, i) => {
        const t = i / 11;
        const x = -20 + t * 1240;
        const sag = Math.sin(t * Math.PI) * (70 + row * 26);
        return `<circle cx="${x.toFixed(0)}" cy="${(y + sag).toFixed(0)}" r="9" fill="#ffe9b8"/><circle cx="${x.toFixed(0)}" cy="${(y + sag).toFixed(0)}" r="26" fill="url(#glow)"/>`;
      }).join("");
      return `<path d="M-20 ${y} Q 600 ${y + 150 + row * 52} 1220 ${y}" stroke="#2a2033" stroke-width="3" fill="none"/>${bulbs}`;
    }).join("")}
    <ellipse cx="600" cy="1290" rx="470" ry="160" fill="#ffca84" opacity=".14" filter="url(#b)"/>
    <ellipse cx="600" cy="1330" rx="330" ry="70" fill="#0a0710" opacity=".55" filter="url(#s)"/>
    <g fill="#120c1c">
      <path d="M690 700 C 742 716, 764 780, 770 860 C 782 980, 830 1160, 900 1330 L470 1330 C 560 1150, 616 970, 630 858 C 640 772, 648 714, 690 700Z"/>
      <circle cx="690" cy="640" r="62"/>
      <path d="M632 636 C 628 566, 672 528, 716 534 C 764 540, 780 590, 770 648 C 756 600, 708 574, 660 596Z"/>
      <circle cx="776" cy="676" r="34"/>
      <path d="M520 700 C 462 712, 432 776, 428 858 C 424 960, 428 1180, 424 1330 H610 C 600 1180, 588 980, 584 866 C 580 776, 568 712, 520 700Z"/>
      <circle cx="520" cy="638" r="58"/>
      <path d="M466 626 C 460 562, 500 528, 542 532 C 586 536, 602 578, 594 630 C 578 588, 534 566, 490 588Z"/>
      <path d="M560 760 C 608 742, 660 748, 700 776 C 656 800, 600 800, 560 782Z"/>
    </g>
    <path d="M630 858 C 676 890, 740 888, 770 856 C 782 980, 830 1160, 900 1330 L700 1330 C 664 1150, 636 980, 630 858Z" fill="#2a2036" opacity=".75"/>
    ${Array.from({ length: 40 }, () => `<circle cx="${(rand() * W).toFixed(0)}" cy="${(rand() * 1200).toFixed(0)}" r="${(1 + rand() * 2).toFixed(1)}" fill="#ffe9b8" opacity="${(0.2 + rand() * 0.6).toFixed(2)}"/>`).join("")}`,
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
