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

// Llama de aura: se dibuja apuntando hacia arriba desde el radio 50 hasta ~100.
const FLAMES = [
  "M-6 -46C-9 -64 -3 -82 1 -106C6 -84 10 -64 6 -46Z",
  "M-6 -46C-9 -60 -11 -74 -6 -92C2 -80 8 -62 6 -46Z",
  "M-5 -46C-6 -66 2 -78 7 -98C9 -78 10 -62 5 -46Z",
  "M-6 -46C-8 -58 -4 -68 -2 -80C4 -70 8 -58 6 -46Z",
];

/**
 * Aura dorada de Super Saiyayin: llamas alrededor de la foto que parpadean y un resplandor que late.
 * Sólo transform/opacity; con `data-calm` se queda quieta.
 */
export function Aura({ className = "", tongues = 24 }) {
  const id = `bsd-aura-${tongues}`;
  const ring = (offset, scale, tone) =>
    Array.from({ length: tongues }, (_, i) => (
      <g key={`${tone}${i}`} transform={`rotate(${(360 / tongues) * i + offset})`}>
        <path className="bsd-aura__flame" d={FLAMES[(i * 3 + offset) % 4]} fill={`url(#${id}-${tone})`} style={{ "--d": `${((i * 7) % tongues) * 0.11}s`, "--s": scale }} />
      </g>
    ));
  return (
    <svg className={`bsd-aura ${className}`} viewBox="-110 -110 220 220" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glow`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(105)">
          <stop offset=".45" stopColor="#fff6a8" stopOpacity=".9" />
          <stop offset=".75" stopColor="#ffc928" stopOpacity=".5" />
          <stop offset="1" stopColor="#ff9a00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-out`} x1="0" y1="-50" x2="0" y2="-100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff6a8" />
          <stop offset=".55" stopColor="#ffd21a" />
          <stop offset="1" stopColor="#ff9a00" stopOpacity=".05" />
        </linearGradient>
        <linearGradient id={`${id}-in`} x1="0" y1="-50" x2="0" y2="-90" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#fff08a" />
          <stop offset="1" stopColor="#ffd21a" stopOpacity=".05" />
        </linearGradient>
      </defs>
      <circle className="bsd-aura__glow" r="105" fill={`url(#${id}-glow)`} />
      {ring(0, 1, "out")}
      {ring(360 / tongues / 2, 0.78, "in")}
    </svg>
  );
}

export default DragonBall;
