// Escenarios temáticos en SVG (livianos, sin imágenes externas).
// preserveAspectRatio "xMidYMax slice": se adaptan a vertical y horizontal sin deformarse.

const rand = (seed) => {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
};

function Stars({ count, seed, color = "#fff", maxY = 1000 }) {
  const r = rand(seed);
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={r() * 1600} cy={r() * maxY} r={0.8 + r() * 2.2} opacity={0.4 + r() * 0.6} />
      ))}
    </g>
  );
}

function Heroes() {
  const r = rand(7);
  const buildings = (y, h, color, seed) => {
    const rr = rand(seed);
    let x = -20;
    const out = [];
    while (x < 1620) {
      const w = 60 + rr() * 90;
      const bh = h * (0.45 + rr() * 0.55);
      out.push(<rect key={x} x={x} y={y - bh} width={w} height={bh + 400} fill={color} />);
      if (seed === 3) {
        for (let wy = y - bh + 20; wy < y - 10; wy += 34) {
          for (let wx = x + 12; wx < x + w - 16; wx += 24) {
            if (rr() > 0.45) out.push(<rect key={`${wx}-${wy}`} x={wx} y={wy} width="10" height="16" fill="#ffe9a8" opacity=".75" />);
          }
        }
      }
      x += w + 6;
    }
    return out;
  };
  return (
    <>
      <defs>
        <linearGradient id="kp-h-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d6fe0" />
          <stop offset=".6" stopColor="#58b4ff" />
          <stop offset="1" stopColor="#ffd6a0" />
        </linearGradient>
        <pattern id="kp-h-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.2" fill="#fff" opacity=".12" />
        </pattern>
      </defs>
      <rect width="1600" height="1200" fill="url(#kp-h-sky)" />
      <rect width="1600" height="1200" fill="url(#kp-h-dots)" />
      <g fill="#fff" opacity=".85">
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx={120 + i * 290 + r() * 60} cy={120 + (i % 3) * 90} rx={110 + r() * 50} ry={36} />
        ))}
      </g>
      <g opacity=".55">{buildings(980, 460, "#6b8fd6", 1)}</g>
      <g>{buildings(1060, 360, "#23408f", 3)}</g>
    </>
  );
}

function Princess() {
  const tower = (x, w, h, color) => (
    <g key={x} fill={color}>
      <rect x={x} y={1200 - h} width={w} height={h} />
      <polygon points={`${x - 16},${1200 - h} ${x + w + 16},${1200 - h} ${x + w / 2},${1200 - h - w * 1.3}`} fill="#b04f9a" />
      <rect x={x + w / 2 - 12} y={1200 - h + 40} width="24" height="44" rx="12" fill="#fff4b8" opacity=".85" />
    </g>
  );
  return (
    <>
      <defs>
        <linearGradient id="kp-p-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5fd6" />
          <stop offset=".55" stopColor="#f39ac8" />
          <stop offset="1" stopColor="#ffe0ef" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1200" fill="url(#kp-p-sky)" />
      <Stars count={90} seed={11} color="#fff7d6" maxY={650} />
      <path d="M-100 900 A 900 520 0 0 1 1700 900" stroke="#fff" strokeWidth="22" fill="none" opacity=".25" />
      <g opacity=".5">{[80, 330, 1180, 1420].map((x, i) => tower(x, 90, 380 + i * 30, "#e7b6e8"))}</g>
      <g fill="#fbe6ff">
        <rect x="560" y="820" width="480" height="380" />
        {[520, 680, 860, 1020].map((x, i) => tower(x, 80, [460, 560, 560, 460][i], "#fbe6ff"))}
        <path d="M740 1200 V1040 A 60 60 0 0 1 860 1040 V1200Z" fill="#b04f9a" />
      </g>
    </>
  );
}

function Dinos() {
  const r = rand(23);
  return (
    <>
      <defs>
        <linearGradient id="kp-d-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f9e6b" />
          <stop offset=".55" stopColor="#9fdc7c" />
          <stop offset="1" stopColor="#ffe08a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1200" fill="url(#kp-d-sky)" />
      <path d="M980 900 L1180 520 L1260 520 L1470 900Z" fill="#7a4a2b" />
      <path d="M1180 520 Q 1220 470 1260 520 Q 1240 560 1200 560Z" fill="#ff7a2f" />
      <g fill="#fff" opacity=".55">
        <circle cx="1210" cy="440" r="46" />
        <circle cx="1270" cy="370" r="60" />
        <circle cx="1350" cy="300" r="72" />
      </g>
      <path d="M200 1000 C 260 860, 360 800, 420 820 C 470 700, 520 620, 580 640 C 600 660, 560 700, 540 760 C 620 780, 700 860, 720 1000Z" fill="#2b6b3f" opacity=".85" />
      <path d="M-40 1200 C 200 980, 520 1020, 800 1080 S 1400 980, 1660 1080 V1200Z" fill="#3d8b3f" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = r() * 1600;
        const s = 0.7 + r() * 0.8;
        return (
          <g key={i} transform={`translate(${x} ${1120 - r() * 80}) scale(${s})`} fill="#1f5c2e">
            {[-60, -25, 10, 45].map((a) => (
              <ellipse key={a} cx="0" cy="-90" rx="22" ry="90" transform={`rotate(${a})`} />
            ))}
          </g>
        );
      })}
    </>
  );
}

function Space() {
  return (
    <>
      <defs>
        <radialGradient id="kp-s-sky" cx=".5" cy=".3" r=".9">
          <stop offset="0" stopColor="#2a2f8f" />
          <stop offset="1" stopColor="#070a24" />
        </radialGradient>
        <radialGradient id="kp-s-planet" cx=".35" cy=".35" r=".7">
          <stop offset="0" stopColor="#ffb86b" />
          <stop offset="1" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1200" fill="url(#kp-s-sky)" />
      <Stars count={220} seed={31} />
      <circle cx="1010" cy="230" r="110" fill="url(#kp-s-planet)" />
      <ellipse cx="1010" cy="230" rx="185" ry="34" fill="none" stroke="#ffd9a8" strokeWidth="10" opacity=".7" transform="rotate(-18 1010 230)" />
      <circle cx="610" cy="120" r="46" fill="#7dd3fc" opacity=".9" />
      <circle cx="594" cy="108" r="11" fill="#38bdf8" opacity=".6" />
      <path d="M-100 1200 C 300 1000, 1300 1000, 1700 1200Z" fill="#9aa3c8" />
      <g fill="#7c85ad">
        <ellipse cx="420" cy="1140" rx="70" ry="18" />
        <ellipse cx="1100" cy="1120" rx="90" ry="20" />
        <ellipse cx="760" cy="1170" rx="50" ry="12" />
      </g>
    </>
  );
}

const SCENES = { heroes: Heroes, princess: Princess, dinos: Dinos, space: Space };

export default function Scenery({ theme }) {
  const Scene = SCENES[theme] || Heroes;
  return (
    <svg className="kp-scenery" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <Scene />
    </svg>
  );
}
