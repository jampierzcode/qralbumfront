// Cielo de aventura detrás de la invitación: atardecer o cielo abierto, rayos de energía,
// nubes gordas, un mar con su isla y la silueta de una casita. Todo en SVG (liviano, sin imágenes)
// y "xMidYMax slice" para que funcione en vertical y horizontal.

const PALETTES = {
  girl: {
    sky: ["#f0679d", "#ff9d80", "#ffd08a"],
    ray: "#ffffff",
    sun: "#fff3b8",
    glow: "#ffe1a0",
    cloudBack: "#ffc1b0",
    cloud: "#fff0e6",
    sea: ["#ff8fa8", "#e0608f"],
    isle: "#ffbf9a",
    roof: "#f26a7c",
  },
  boy: {
    sky: ["#2f7fd6", "#6fb6f2", "#cdeaff"],
    ray: "#ffffff",
    sun: "#fff6c4",
    glow: "#eaf6ff",
    cloudBack: "#bcdcf8",
    cloud: "#ffffff",
    sea: ["#4fa6e8", "#2c6fbf"],
    isle: "#f6e1a6",
    roof: "#f2683e",
  },
  surprise: {
    sky: ["#7a55c9", "#e58aa8", "#ffc98a"],
    ray: "#ffffff",
    sun: "#fff3b8",
    glow: "#ffdcae",
    cloudBack: "#e2b6d8",
    cloud: "#fff0f5",
    sea: ["#b878d8", "#7c4fb8"],
    isle: "#ffd0a4",
    roof: "#ef6a86",
  },
};

// Rayos que salen del sol (estilo manga). Ángulos fijos: sin aleatorio, el render es estable.
const RAYS = Array.from({ length: 18 }, (_, i) => i);

export default function Scenery({ gender = "girl" }) {
  const p = PALETTES[gender] || PALETTES.girl;
  const id = `bsd-${gender}`;
  return (
    <svg className="bsd-scenery" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset=".55" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sea[0]} />
          <stop offset="1" stopColor={p.sea[1]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={p.glow} stopOpacity=".95" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="1200" fill={`url(#${id}-sky)`} />

      {/* Rayos de energía desde el sol */}
      <g transform="translate(800 390)" fill={p.ray} opacity=".16">
        {RAYS.map((i) => (
          <path key={i} d="M0 0 L-46 -1400 L46 -1400Z" transform={`rotate(${i * 20})`} />
        ))}
      </g>
      <circle cx="800" cy="390" r="420" fill={`url(#${id}-glow)`} />
      <circle cx="800" cy="390" r="150" fill={p.sun} />

      {/* Nubes altas */}
      <g fill={p.cloud} opacity=".92">
        <ellipse cx="260" cy="260" rx="170" ry="52" />
        <ellipse cx="350" cy="228" rx="110" ry="50" />
        <ellipse cx="1330" cy="180" rx="190" ry="56" />
        <ellipse cx="1240" cy="152" rx="100" ry="46" />
        <ellipse cx="1180" cy="520" rx="150" ry="44" opacity=".8" />
      </g>

      {/* Mar, isla y casita */}
      <rect x="0" y="880" width="1600" height="320" fill={`url(#${id}-sea)`} />
      <g fill="#fff" opacity=".25">
        <rect x="120" y="930" width="220" height="8" rx="4" />
        <rect x="1180" y="990" width="260" height="8" rx="4" />
        <rect x="520" y="1060" width="200" height="8" rx="4" />
      </g>
      <g transform="translate(560 0)">
        <ellipse cx="800" cy="905" rx="290" ry="42" fill={p.isle} />
        <rect x="716" y="800" width="120" height="100" rx="6" fill="#fff4ea" />
        <path d="M700 806 776 742 852 806Z" fill={p.roof} />
        <rect x="754" y="838" width="30" height="62" rx="4" fill="#c99074" />
        <path d="M905 903c-2-60 6-110 22-150M927 753c-40-6-70 6-92 34M927 753c34-14 66-8 88 20M927 753c-4-32 14-58 40-70" fill="none" stroke="#2e8b57" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* Nubes del frente */}
      <g fill={p.cloudBack} opacity=".8">
        <ellipse cx="160" cy="1090" rx="300" ry="96" />
        <ellipse cx="1000" cy="1110" rx="330" ry="90" />
      </g>
      <g fill={p.cloud}>
        <ellipse cx="120" cy="1190" rx="310" ry="96" />
        <ellipse cx="560" cy="1210" rx="280" ry="88" />
        <ellipse cx="960" cy="1185" rx="330" ry="102" />
        <ellipse cx="1400" cy="1210" rx="300" ry="94" />
        <rect x="0" y="1190" width="1600" height="30" />
      </g>
    </svg>
  );
}
