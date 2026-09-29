// Ilustraciones de la invitación en SVG propio: el radar del dragón (Cómo llegar)
// y la cápsula envuelta en energía azul (cuenta regresiva).
import { blade } from "./Dragon.jsx";

const jit = (i) => ((i * 41 + 7) % 17) / 17;
const GRID = Array.from({ length: 9 }, (_, i) => 40 + i * 15);

/** Radar del dragón: pantalla verde con cuadrícula, esferas que parpadean y la mira roja al centro. */
export function Radar({ className = "" }) {
  return (
    <svg className={`bsd-radar ${className}`} viewBox="0 0 200 236" aria-hidden="true">
      <defs>
        <clipPath id="bsd-radar-clip"><circle cx="100" cy="140" r="64" /></clipPath>
        <linearGradient id="bsd-radar-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b8ffb0" stopOpacity=".55" />
          <stop offset="1" stopColor="#b8ffb0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* tapa y cuello */}
      <path d="M84 60 88 44H112L116 60Z" fill="#c9ccd3" stroke="#101010" strokeWidth="4" strokeLinejoin="round" />
      <path d="M78 34C78 18 88 12 100 12S122 18 122 34L118 44H82Z" fill="#d6d8de" stroke="#101010" strokeWidth="4" strokeLinejoin="round" />
      <g fill="#101010"><circle cx="112" cy="30" r="1.8" /><circle cx="107" cy="35" r="1.8" /><circle cx="116" cy="36" r="1.8" /></g>
      {/* aro plateado */}
      <circle cx="100" cy="140" r="86" fill="#d8dae0" stroke="#101010" strokeWidth="5" />
      <path d="M40 104A66 66 0 0 1 96 62" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".85" />
      <g fill="#101010"><circle cx="181" cy="146" r="1.8" /><circle cx="181" cy="153" r="1.8" /><circle cx="92" cy="220" r="1.8" /><circle cx="99" cy="220" r="1.8" /></g>
      {/* pantalla */}
      <circle cx="100" cy="140" r="69" fill="#1fa42a" stroke="#101010" strokeWidth="4" />
      <g clipPath="url(#bsd-radar-clip)">
        <rect x="30" y="70" width="140" height="140" fill="#22b02c" />
        <g stroke="#0b3d0f" strokeWidth="2.4" fill="none">
          {GRID.map((x) => <path key={`v${x}`} d={`M${x} 70Q${x + (x - 100) * 0.1} 140 ${x} 210`} />)}
          {GRID.map((y) => <path key={`h${y}`} d={`M30 ${y + 30}Q100 ${y + 30 + (y - 100) * 0.1} 170 ${y + 30}`} />)}
        </g>
        <g className="bsd-radar__sweep">
          <path d="M100 140V74A66 66 0 0 1 146 94Z" fill="url(#bsd-radar-sweep)" />
        </g>
        {[[139, 105, 6, 1], [78, 158, 8, 4], [92, 187, 8, 3]].map(([x, y, r, dots], i) => (
          <g key={i} className="bsd-radar__blip" style={{ "--d": `${i * 0.5}s` }}>
            <circle cx={x} cy={y} r={r} fill="#f7b21c" />
            <g fill="#101010">
              {Array.from({ length: dots }, (_, k) => (
                <circle key={k} cx={x + (dots === 1 ? 0 : Math.cos((k / dots) * 6.28 + 0.6) * r * 0.45)} cy={y + (dots === 1 ? 0 : Math.sin((k / dots) * 6.28 + 0.6) * r * 0.45)} r="1.5" />
              ))}
            </g>
          </g>
        ))}
        <path d="M76 152H124M100 128V176" stroke="#f4ee3a" strokeWidth="2.4" />
        <path d="M100 141 110 160H90Z" fill="#e2242a" stroke="#101010" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="103" cy="154" r="1.6" fill="#101010" />
      </g>
    </svg>
  );
}

// Llamas de energía: envuelven la cápsula y dejan una estela larga hacia abajo a la derecha.
// [ángulo (grados desde arriba, en sentido del reloj), largo, medio ancho]
const TRAIL = Array.from({ length: 22 }, (_, i) => {
  const theta = 20 + (i / 21) * 230;
  const weight = Math.max(0, Math.cos(((theta - 125) * Math.PI) / 180));
  return [theta, 46 + weight * 96 + jit(i + 2) * 22, 8 + weight * 6 + jit(i) * 4];
});

/** Cápsula (nave redonda con su ventana roja) envuelta en energía azul que deja estela. */
export function Pod({ className = "" }) {
  return (
    <svg className={`bsd-pod ${className}`} viewBox="0 0 300 210" aria-hidden="true">
      <defs>
        <linearGradient id="bsd-pod-blade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".35" stopColor="#7fd0ff" />
          <stop offset="1" stopColor="#1a8cf0" stopOpacity=".35" />
        </linearGradient>
        <radialGradient id="bsd-pod-core" cx=".5" cy=".5" r=".5">
          <stop offset=".5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#9fe0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="bsd-pod__energy">
        {/* estela: rayos que salen en abanico hacia atrás */}
        {TRAIL.map(([theta, len, w], i) => (
          <g key={i} transform={`translate(112 94) rotate(${theta.toFixed(1)})`}>
            <g className="bsd-aura__flame" style={{ "--d": `${-((i * 0.17) % 0.55)}s` }}>
              <path d={blade(w, len)} fill="url(#bsd-pod-blade)" />
            </g>
          </g>
        ))}
        <ellipse cx="150" cy="112" rx="96" ry="64" transform="rotate(35 150 112)" fill="url(#bsd-pod-core)" />
        <ellipse cx="176" cy="128" rx="70" ry="22" transform="rotate(40 176 128)" fill="#ffffff" opacity=".85" />
      </g>
      {/* la cápsula */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <circle cx="112" cy="94" r="44" fill="#cfe4f6" stroke="#3a3a4a" strokeWidth="2.6" />
        <circle cx="122" cy="102" r="29" fill="#7fb0e4" opacity=".7" />
        <path d="M84 62C96 52 116 50 130 56" fill="none" stroke="#fff" strokeWidth="3" opacity=".8" />
        <g transform="rotate(-32 90 78)">
          <ellipse cx="90" cy="78" rx="21" ry="13" fill="#d2323a" stroke="#3a3a4a" strokeWidth="2.6" />
          <path d="M78 76C84 71 92 70 100 73" fill="none" stroke="#ff9aa0" strokeWidth="2.4" />
        </g>
        <g stroke="#3a3a4a" strokeWidth="1.6" opacity=".55" fill="none">
          <path d="M126 96l7-3M132 108l7-3M120 114l6-2M140 100l6-1" />
        </g>
        <path d="M76 104C74 80 94 60 118 60" fill="none" stroke="#3a3a4a" strokeWidth="2" opacity=".5" />
      </g>
    </svg>
  );
}
