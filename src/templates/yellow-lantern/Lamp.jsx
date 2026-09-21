import { useId } from "react";

// Cúpula de cristal sobre base de madera, con musgo, una mariquita, el hilo de luces y la flor.
// Todo es SVG en un lienzo de 320×490: escala sin perder nitidez y sólo se anima transform/opacity.
// Estado apagado / encendido: lo decide el atributo data-lit del <svg> (ver styles.css).

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOME = "M66 430V200C66 96 108 40 160 40C212 40 254 96 254 200V430";

// Musgo: puntitos de verdes distintos sobre el montículo.
const MOSS = (() => {
  const r = rng(11);
  return Array.from({ length: 58 }, () => {
    const x = 80 + r() * 160;
    const lift = Math.max(0, 1 - Math.abs(x - 160) / 90) * 44;
    return { x, y: 432 - r() * (lift + 6), r: 1.8 + r() * 3.6, tone: r() };
  });
})();

// Semillas del girasol en espiral áurea (como las de verdad).
const SEEDS = Array.from({ length: 70 }, (_, i) => {
  const n = i + 1;
  const angle = n * 2.399963;
  const rad = 3.3 * Math.sqrt(n);
  return { x: 160 + rad * Math.cos(angle), y: 190 + rad * Math.sin(angle), r: 1.25 + (i % 3) * 0.3 };
});

const PETALS = Array.from({ length: 18 }, (_, i) => i);

// Hilo de luces: una espiral que sube por dentro de la cúpula.
const WIRE = Array.from({ length: 121 }, (_, i) => {
  const t = i / 120;
  return { x: 160 + 82 * (1 - 0.6 * t) * Math.sin(2 * Math.PI * 3.2 * t + 0.5), y: 424 - 340 * t };
});
const WIRE_PATH = WIRE.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");
const BULBS = Array.from({ length: 15 }, (_, k) => ({ ...WIRE[Math.round(((k + 1) / 16) * 120)], i: k }));

function Sunflower({ ids }) {
  return (
    <g className="yl-flower yl-flower--sunflower">
      <path d="M160 400C163 340 156 280 160 226" fill="none" stroke={`url(#${ids.stem})`} strokeWidth="8" strokeLinecap="round" />
      <path d="M158 340C124 336 104 312 104 284C134 286 156 308 158 340Z" fill={`url(#${ids.leaf})`} />
      <path d="M160 316C196 312 218 288 218 260C186 262 162 284 160 316Z" fill={`url(#${ids.leaf})`} />
      <path d="M158 340C138 322 122 304 108 286M160 316C182 298 200 282 214 264" fill="none" stroke="#2f6420" strokeWidth="1.4" opacity=".55" />
      <g className="yl-flower__head">
        <g className="yl-flower__petals yl-flower__petals--back">
          {PETALS.map((i) => (
            <ellipse key={i} cx="160" cy="146" rx="13" ry="34" fill={`url(#${ids.petalBack})`} transform={`rotate(${i * 20 + 10} 160 190)`} />
          ))}
        </g>
        <g className="yl-flower__petals">
          {PETALS.map((i) => (
            <ellipse key={i} cx="160" cy="147" rx="12.5" ry="32" fill={`url(#${ids.petal})`} transform={`rotate(${i * 20} 160 190)`} />
          ))}
        </g>
        <circle cx="160" cy="190" r="31" fill={`url(#${ids.disc})`} />
        {SEEDS.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r} fill={i % 2 ? "#2a1608" : "#5a3411"} opacity=".8" />
        ))}
      </g>
    </g>
  );
}

function Tulip({ cx, cy, ids, tone = 0 }) {
  const cup = `M${cx - 22} ${cy - 6}C${cx - 25} ${cy - 32} ${cx - 15} ${cy - 46} ${cx - 7} ${cy - 52}L${cx} ${cy - 38}L${cx + 7} ${cy - 52}C${cx + 15} ${cy - 46} ${cx + 25} ${cy - 32} ${cx + 22} ${cy - 6}C${cx + 18} ${cy + 20} ${cx - 18} ${cy + 20} ${cx - 22} ${cy - 6}Z`;
  return (
    <g className="yl-flower__tulip" style={{ "--tone": tone }}>
      <path d={`M${cx} ${cy + 12}C${cx + 3} ${cy + 80} ${cx - 4} ${cy + 140} ${cx} 404`} fill="none" stroke={`url(#${ids.stem})`} strokeWidth="6" strokeLinecap="round" />
      <path d={cup} fill={`url(#${ids.tulip})`} />
      <path d={`M${cx - 12} ${cy - 4}C${cx - 10} ${cy - 30} ${cx - 3} ${cy - 40} ${cx} ${cy - 30}C${cx + 3} ${cy - 40} ${cx + 10} ${cy - 30} ${cx + 12} ${cy - 4}C${cx + 6} ${cy + 12} ${cx - 6} ${cy + 12} ${cx - 12} ${cy - 4}Z`} fill="#fff6bd" opacity=".5" />
    </g>
  );
}

function Tulips({ ids }) {
  return (
    <g className="yl-flower yl-flower--tulips">
      <path d="M158 404C120 380 96 330 104 262C138 292 156 340 158 404Z" fill={`url(#${ids.leaf})`} />
      <path d="M162 404C200 380 226 330 218 268C184 296 164 340 162 404Z" fill={`url(#${ids.leaf})`} />
      <path d="M160 404C150 360 146 320 152 286C166 320 168 360 160 404Z" fill={`url(#${ids.leaf})`} opacity=".9" />
      <Tulip cx={118} cy={236} ids={ids} tone={0} />
      <Tulip cx={204} cy={246} ids={ids} tone={1} />
      <Tulip cx={160} cy={196} ids={ids} tone={2} />
    </g>
  );
}

/** Lámpara: cúpula de cristal + base de madera. `flower` = "sunflower" | "tulips". */
export default function Lamp({ flower = "sunflower", lit = false, className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = Object.fromEntries(
    ["wood", "woodTop", "moss", "inner", "glass", "petal", "petalBack", "disc", "stem", "leaf", "tulip", "bulb"].map((name) => [name, `yl${uid}${name}`])
  );

  return (
    <svg className={`yl-lamp ${className}`} data-lit={lit ? "true" : undefined} viewBox="0 0 320 490" role="img" aria-label="Lámpara de cristal con una flor amarilla">
      <defs>
        <linearGradient id={ids.wood} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b07a" />
          <stop offset="1" stopColor="#8f6234" />
        </linearGradient>
        <radialGradient id={ids.woodTop} cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#f0cf9c" />
          <stop offset="1" stopColor="#b98a52" />
        </radialGradient>
        <linearGradient id={ids.moss} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc24c" />
          <stop offset="1" stopColor="#3f7a27" />
        </linearGradient>
        <radialGradient id={ids.inner} cx="50%" cy="46%" r="62%">
          <stop offset="0" stopColor="#fff3b0" stopOpacity=".8" />
          <stop offset=".4" style={{ stopColor: "var(--yl-glow, #ffc83d)" }} stopOpacity=".62" />
          <stop offset="1" style={{ stopColor: "var(--yl-glow-deep, #ff9f1c)" }} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dbe8ff" stopOpacity=".2" />
          <stop offset=".5" stopColor="#dbe8ff" stopOpacity=".04" />
          <stop offset="1" stopColor="#dbe8ff" stopOpacity=".16" />
        </linearGradient>
        <linearGradient id={ids.petal} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe873" />
          <stop offset="1" stopColor="#f6a800" />
        </linearGradient>
        <linearGradient id={ids.petalBack} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7c928" />
          <stop offset="1" stopColor="#d98a00" />
        </linearGradient>
        <radialGradient id={ids.disc} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#8a5314" />
          <stop offset="1" stopColor="#3b220d" />
        </radialGradient>
        <linearGradient id={ids.stem} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fa03a" />
          <stop offset="1" stopColor="#2f6420" />
        </linearGradient>
        <linearGradient id={ids.leaf} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7cc04a" />
          <stop offset="1" stopColor="#367a26" />
        </linearGradient>
        <linearGradient id={ids.tulip} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe45e" />
          <stop offset="1" stopColor="#f4a300" />
        </linearGradient>
        <radialGradient id={ids.bulb} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset=".35" stopColor="#ffe27a" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffbf3a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="yl-lamp__scene">
        {/* base de madera */}
        <path d="M36 436V452C36 476 284 476 284 452V436Z" fill={`url(#${ids.wood})`} />
        <ellipse cx="160" cy="436" rx="124" ry="22" fill={`url(#${ids.woodTop})`} />
        <ellipse cx="160" cy="432" rx="96" ry="14" fill="#8a5f2e" opacity=".55" />

        {/* musgo y mariquita */}
        <path d="M72 432C82 396 122 382 160 382C198 382 238 396 248 432Z" fill={`url(#${ids.moss})`} />
        {MOSS.map((m, i) => (
          <circle key={i} cx={m.x.toFixed(1)} cy={m.y.toFixed(1)} r={m.r.toFixed(1)} fill={m.tone > 0.5 ? "#a8d65c" : "#3d7a26"} opacity=".7" />
        ))}
        <g className="yl-lamp__bug">
          <circle cx="212" cy="404" r="6.5" fill="#d8362b" />
          <path d="M212 397.5V410.5" stroke="#2a1a14" strokeWidth="1.1" />
          <circle cx="208.6" cy="402" r="1.2" fill="#2a1a14" />
          <circle cx="215.4" cy="406" r="1.2" fill="#2a1a14" />
          <circle cx="212" cy="397" r="2.6" fill="#2a1a14" />
        </g>

      </g>

      {/* luz de adentro, DETRÁS de la flor (se enciende con data-lit) */}
      <path className="yl-lamp__lit" d={DOME} fill={`url(#${ids.inner})`} />

      {/* la flor */}
      <g className="yl-lamp__scene">{flower === "tulips" ? <Tulips ids={ids} /> : <Sunflower ids={ids} />}</g>

      {/* un brillo muy suave por delante, para que la flor "irradie" sin lavarse */}
      <path className="yl-lamp__bloom" d={DOME} fill={`url(#${ids.inner})`} />

      {/* hilo de luces */}
      <g className="yl-lamp__wire">
        <path d={WIRE_PATH} fill="none" stroke="#c98a3a" strokeWidth="0.9" strokeLinecap="round" opacity=".55" />
        {BULBS.map((b) => (
          <g key={b.i} className="yl-bulb" style={{ "--i": b.i }}>
            <circle cx={b.x.toFixed(1)} cy={b.y.toFixed(1)} r="8.5" fill={`url(#${ids.bulb})`} />
            <circle cx={b.x.toFixed(1)} cy={b.y.toFixed(1)} r="1.9" fill="#fffbe0" />
          </g>
        ))}
      </g>

      {/* cristal */}
      <path d={DOME} fill={`url(#${ids.glass})`} stroke="#eaf1ff" strokeOpacity=".34" strokeWidth="2" />
      <path className="yl-lamp__shine" d="M86 214C84 140 112 84 150 62" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="6" strokeLinecap="round" />
      <path className="yl-lamp__shine" d="M236 176C240 200 240 250 236 300" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="160" cy="430" rx="94" ry="9" fill="none" stroke="#eaf1ff" strokeOpacity=".3" strokeWidth="2" />
    </svg>
  );
}
