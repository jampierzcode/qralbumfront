// Cielo de cuento detrás de la invitación: luna, estrellas, globos y un mar de nubes.
// Todo en SVG (liviano, sin imágenes) y "xMidYMax slice" para que funcione en vertical y horizontal.

const rand = (seed) => {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
};

const PALETTES = {
  girl: {
    sky: ["#f2a3c9", "#ffd2e4", "#fff3f8"],
    glow: "#ffd9ec",
    moon: "#ffeab4",
    star: "#fff4cf",
    cloudBack: "#ffe4f0",
    cloud: "#ffffff",
    hill: "#f8c7dd",
    balloons: ["#ff9ec7", "#ffc2dd", "#ffe3b0"],
  },
  boy: {
    sky: ["#77abe8", "#c4ddfa", "#f0f7ff"],
    glow: "#d8ebff",
    moon: "#ffefbe",
    star: "#fff7d8",
    cloudBack: "#dbecfd",
    cloud: "#ffffff",
    hill: "#a6cbf3",
    balloons: ["#7fb2ea", "#a9d3f7", "#ffe3b0"],
  },
  surprise: {
    sky: ["#ab9ae4", "#ffd7e8", "#f3fbff"],
    glow: "#eadff9",
    moon: "#ffeab4",
    star: "#fff4cf",
    cloudBack: "#eadff9",
    cloud: "#ffffff",
    hill: "#c9b7ef",
    balloons: ["#ff9ec7", "#7fb2ea", "#ffe3b0"],
  },
};

function Stars({ seed, color }) {
  const r = rand(seed);
  return (
    <g fill={color}>
      {Array.from({ length: 70 }, (_, i) => (
        <circle key={i} cx={320 + r() * 960} cy={230 + r() * 560} r={1 + r() * 2.6} opacity={0.35 + r() * 0.6} />
      ))}
      {Array.from({ length: 10 }, (_, i) => {
        const x = 360 + r() * 880;
        const y = 250 + r() * 470;
        const s = 0.5 + r() * 0.9;
        return (
          <path
            key={`t${i}`}
            transform={`translate(${x} ${y}) scale(${s})`}
            opacity={0.75}
            d="M0-26C2 -9 9 -2 26 0 9 2 2 9 0 26c-2-17-9-24-26-26 17-2 24-9 26-26Z"
          />
        );
      })}
    </g>
  );
}

function Balloon({ x, y, s, color }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 78c0 26 22 26 22 52" fill="none" stroke="#ffffff" strokeWidth="3" opacity=".6" strokeLinecap="round" />
      <ellipse cx="0" cy="0" rx="46" ry="56" fill={color} opacity=".92" />
      <ellipse cx="-14" cy="-18" rx="11" ry="16" fill="#fff" opacity=".45" />
      <path d="M0 55l11 16H-11L0 55Z" fill={color} opacity=".92" />
    </g>
  );
}

export default function Scenery({ gender = "girl" }) {
  const p = PALETTES[gender] || PALETTES.girl;
  const id = `bsh-${gender}`;
  return (
    <svg className="bsh-scenery" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset=".55" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={p.glow} stopOpacity=".95" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="1200" fill={`url(#${id}-sky)`} />
      <Stars seed={gender === "boy" ? 17 : gender === "surprise" ? 29 : 41} color={p.star} />

      {/* Luna con su halo (en la franja central: es lo que se ve en pantalla vertical) */}
      <circle cx="560" cy="330" r="280" fill={`url(#${id}-glow)`} />
      <circle cx="560" cy="330" r="92" fill={p.moon} />
      <g fill="#000" opacity=".035">
        <circle cx="534" cy="304" r="13" />
        <circle cx="588" cy="352" r="9" />
        <circle cx="544" cy="372" r="6" />
      </g>

      {/* Globos que suben */}
      <Balloon x={1040} y={470} s={0.9} color={p.balloons[0]} />
      <Balloon x={1210} y={330} s={0.62} color={p.balloons[1]} />
      <Balloon x={300} y={620} s={0.8} color={p.balloons[2]} />

      {/* Mar de nubes */}
      <g fill={p.cloudBack} opacity=".85">
        <ellipse cx="180" cy="880" rx="230" ry="80" />
        <ellipse cx="620" cy="830" rx="190" ry="66" />
        <ellipse cx="1120" cy="870" rx="240" ry="78" />
        <ellipse cx="1500" cy="820" rx="180" ry="62" />
      </g>
      <path d="M-40 1200V1010c150-70 290-10 430-40s250-110 420-80 250 120 420 90 240-80 410-40v260Z" fill={p.hill} opacity=".9" />
      <g fill={p.cloud}>
        <ellipse cx="120" cy="1090" rx="300" ry="120" />
        <ellipse cx="520" cy="1130" rx="260" ry="110" />
        <ellipse cx="900" cy="1080" rx="320" ry="130" />
        <ellipse cx="1330" cy="1130" rx="290" ry="120" />
        <rect x="0" y="1120" width="1600" height="90" />
      </g>
    </svg>
  );
}
