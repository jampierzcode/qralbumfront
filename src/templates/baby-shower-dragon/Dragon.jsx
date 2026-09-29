// Las esferas del dragón, dibujadas en SVG propio: una bola naranja con sus estrellas rojas.

const STAR = "M0-1 .29-.4.95-.31.47.15.59.81 0 .5-.59.81-.47.15-.95-.31-.29-.4Z";

// Posición de las estrellas (en unidades del radio) según cuántas lleva la esfera.
const LAYOUTS = {
  1: [[0, 0, 0.36]],
  2: [[-0.3, 0, 0.26], [0.3, 0, 0.26]],
  3: [[0, -0.32, 0.24], [-0.32, 0.22, 0.24], [0.32, 0.22, 0.24]],
  4: [[-0.3, -0.3, 0.23], [0.3, -0.3, 0.23], [-0.3, 0.3, 0.23], [0.3, 0.3, 0.23]],
  5: [[-0.34, -0.34, 0.2], [0.34, -0.34, 0.2], [0, 0, 0.2], [-0.34, 0.34, 0.2], [0.34, 0.34, 0.2]],
  6: [[-0.3, -0.4, 0.2], [0.3, -0.4, 0.2], [-0.3, 0, 0.2], [0.3, 0, 0.2], [-0.3, 0.4, 0.2], [0.3, 0.4, 0.2]],
  7: [[0, 0, 0.19], [0, -0.45, 0.19], [0.4, -0.22, 0.19], [0.4, 0.22, 0.19], [0, 0.45, 0.19], [-0.4, 0.22, 0.19], [-0.4, -0.22, 0.19]],
};

/** Esfera del dragón de 1 a 7 estrellas. Hereda el tamaño del contenedor. */
export function DragonBall({ stars = 4, className = "" }) {
  const id = `bsd-ball-${stars}`;
  return (
    <svg className={`bsd-ball ${className}`} viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx=".36" cy=".3" r=".85">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset=".32" stopColor="#ffc247" />
          <stop offset=".78" stopColor="#f2841a" />
          <stop offset="1" stopColor="#c9550a" />
        </radialGradient>
      </defs>
      <circle r="1" fill={`url(#${id})`} />
      <ellipse cx="-.36" cy="-.46" rx=".3" ry=".17" fill="#fff" opacity=".6" transform="rotate(-32 -.36 -.46)" />
      {LAYOUTS[stars].map(([x, y, s], i) => (
        <path key={i} d={STAR} transform={`translate(${x} ${y}) scale(${s})`} fill="#d3261f" stroke="#a11713" strokeWidth=".06" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

const CLOUD_BUMPS = [
  [55, 52, 36], [96, 40, 33], [134, 50, 29], [78, 74, 29], [116, 74, 27], [40, 70, 23], [150, 72, 21],
];
const CLOUD_TAIL = "M146 60C166 66 186 58 199 62C201 71 194 75 189 73C195 69 190 66 182 67C168 71 158 75 146 75Z";

/** Nube voladora amarilla (con su colita) para los adornos que flotan. */
export function Nimbus({ className = "" }) {
  return (
    <svg className={`bsd-nimbus ${className}`} viewBox="0 8 204 100" aria-hidden="true">
      {/* contorno: las mismas formas, más gruesas, debajo */}
      <g fill="#b8620a" stroke="#b8620a" strokeWidth="5" strokeLinejoin="round">
        {CLOUD_BUMPS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        <path d={CLOUD_TAIL} />
      </g>
      {/* sombra: la misma nube un poco más abajo */}
      <g fill="#dbb300" transform="translate(0 5)">
        {CLOUD_BUMPS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        <path d={CLOUD_TAIL} />
      </g>
      <g fill="#fdf27a">
        {CLOUD_BUMPS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
        <path d={CLOUD_TAIL} />
      </g>
    </svg>
  );
}

/** Scouter (medidor de fuerza): visor rosado, cuerpo blanco y botón rojo. */
export function Scouter({ className = "" }) {
  return (
    <svg className={`bsd-scouter ${className}`} viewBox="0 0 100 100" aria-hidden="true">
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* visor */}
        <path d="M4 26 40 32V76L10 72Z" fill="#e58ad8" stroke="#7a3f82" strokeWidth="3" />
        <path d="M9 32 36 36" stroke="#fff" strokeWidth="2.4" opacity=".7" />
        <circle cx="19" cy="52" r="6" fill="none" stroke="#fff3a8" strokeWidth="2.2" />
        <path d="M11 41l4 5H7ZM11 69l4-5H7Z" fill="#fff3a8" />
        <path d="M27 50h9M27 56h9" stroke="#fff3a8" strokeWidth="2" />
        {/* cuerpo */}
        <path d="M40 22C40 12 50 8 62 12L84 22C90 25 92 31 92 38V70C92 80 86 88 74 88L54 88C44 88 40 82 40 74Z" fill="#f4f4f8" stroke="#5c5c6b" strokeWidth="3" />
        <path d="M66 20 84 28C88 30 89 34 89 40V68C89 78 84 84 74 85L66 85Z" fill="#c6c9d6" />
        <g stroke="#5c5c6b" strokeWidth="2.4">
          <path d="M74 36V64M80 38V62" />
        </g>
        <rect x="40" y="52" width="9" height="13" rx="2.5" fill="#e0312d" stroke="#5c5c6b" strokeWidth="2.4" />
        <path d="M46 20C52 16 60 16 64 18" stroke="#fff" strokeWidth="3" opacity=".8" fill="none" />
      </g>
    </svg>
  );
}

// Ki (aura de Super Saiyayin) como en el anime: rayos largos y afilados, abiertos en abanico hacia arriba
// y hacia los lados, que parpadean en pasos rápidos (unos 5 cuadros) y con rayitas que suben.
const jit = (i) => ((i * 37 + 11) % 13) / 13; // 0..1 fijo: el render es estable

// Cada rayo: [x de la base, y de la base, ángulo (grados desde arriba), largo, medio ancho]
const RAYS = (() => {
  const out = [];
  for (let i = 0; i < 26; i++) {
    const theta = -150 + i * (300 / 25); // posición sobre el aro (0 = arriba)
    const rad = (theta * Math.PI) / 180;
    const bx = Math.sin(rad) * 46;
    const by = -Math.cos(rad) * 46;
    const side = Math.min(1, Math.abs(theta) / 110);
    const dir = Math.max(-62, Math.min(62, theta * 0.52)) + (jit(i) - 0.5) * 12;
    const len = 62 + side * 58 + jit(i + 5) * 34;
    out.push([bx, by, dir, len, 6 + jit(i + 2) * 5]);
  }
  return out;
})();

// Rayitas finas que suben (velocidad)
const STREAKS = Array.from({ length: 14 }, (_, i) => [-92 + i * 14.2 + (jit(i) - 0.5) * 8, 30 + jit(i + 3) * 30, 14 + jit(i + 6) * 22]);

export function blade(w, len) {
  return `M${-w} 0Q${-w * 0.7} ${-len * 0.55} 0 ${-len}Q${w * 0.9} ${-len * 0.5} ${w} 0Z`;
}

/** Aura de ki dorada detrás de la foto. Sólo transform/opacity; quieta con `data-calm`. */
export function Aura({ className = "" }) {
  return (
    <svg className={`bsd-aura ${className}`} viewBox="-130 -130 260 260" aria-hidden="true">
      <defs>
        <radialGradient id="bsd-ki-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(108)">
          <stop offset=".35" stopColor="#fffbb0" stopOpacity=".9" />
          <stop offset=".7" stopColor="#ffd400" stopOpacity=".45" />
          <stop offset="1" stopColor="#ffb000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bsd-ki-ray" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff9a0" />
          <stop offset=".4" stopColor="#ffea00" />
          <stop offset="1" stopColor="#e8b800" stopOpacity=".15" />
        </linearGradient>
        <linearGradient id="bsd-ki-core" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fff36a" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <ellipse className="bsd-aura__glow" cx="0" cy="0" rx="108" ry="112" fill="url(#bsd-ki-glow)" />
      {RAYS.map(([x, y, dir, len, w], i) => (
        <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${dir.toFixed(1)})`}>
          <g className="bsd-aura__flame" style={{ "--d": `${-((i * 0.13) % 0.55)}s` }}>
            <path d={blade(w, len)} fill="url(#bsd-ki-ray)" />
            <path d={blade(w * 0.45, len * 0.6)} fill="url(#bsd-ki-core)" opacity=".75" />
          </g>
        </g>
      ))}
      {STREAKS.map(([x, y, h], i) => (
        <rect key={`s${i}`} className="bsd-aura__streak" x={x} y={y} width="1.6" height={h} rx=".8" fill="#fff8a8" style={{ "--d": `${-((i * 0.29) % 1.2)}s` }} />
      ))}
    </svg>
  );
}

export default DragonBall;
