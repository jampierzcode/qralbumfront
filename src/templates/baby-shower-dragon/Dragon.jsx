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

// Ki (aura de Super Saiyayin) como en el anime: una silueta alta, en forma de gota, cuyo contorno son
// picos que apuntan hacia arriba (los de los lados se inclinan hacia arriba y hay uno largo en la cima).
// Se dibujan 3 variantes de la silueta y se alternan por cuadros para que parpadee como el GIF.
const AURA_BOTTOM = 80; // y del pie de la silueta
const AURA_TOP = -148; // y de la cima
const AURA_HALF = 74; // medio ancho máximo

const rnd = (seed) => {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
};

// Medio ancho de la silueta a la altura t (0 = pie, 1 = cima)
const halfWidth = (t) => AURA_HALF * Math.pow(1 - t * t, 0.9);
const edgeY = (t) => AURA_BOTTOM + (AURA_TOP - AURA_BOTTOM) * t;

/** Camino de la silueta con picos hacia arriba. `seed` cambia el tamaño de los picos entre variantes. */
function auraPath(seed) {
  const r = rnd(seed);
  const N = 15;
  const side = (dir) => {
    const pts = [];
    for (let k = 0; k < N; k++) {
      const t0 = 0.03 + (k / N) * 0.93;
      const t1 = Math.min(0.985, t0 + (1.7 / N) * 0.93);
      const inset = 5 + r() * 6;
      const out = 7 + r() * 14 + (1 - t0) * 4;
      // valle sobre el borde (un poco hacia dentro) y punta más arriba y hacia fuera
      pts.push([dir * (halfWidth(t0) - inset), edgeY(t0)]);
      pts.push([dir * (halfWidth(t1) + out), edgeY(t1) - 3]);
    }
    return pts;
  };
  const left = side(-1);
  const right = side(1);
  // pie: picos que abren hacia afuera y abajo
  const foot = [[0, 84], [-22, 104 + r() * 5], [-28, 86], [-52, 100 + r() * 5], [-54, 82], [-80, 88 + r() * 6], [-76, 76]];
  const footR = [[76, 76], [80, 88 + r() * 6], [54, 82], [52, 100 + r() * 5], [28, 86], [22, 104 + r() * 5]];
  const pts = [...foot, ...left, [-7, edgeY(0.93)], [0, AURA_TOP - 6 - r() * 6], [7, edgeY(0.93)], ...right.reverse(), ...footR];
  return `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
}

// Capas anidadas (comparten el pie y se acortan hacia arriba): exterior y media. 3 variantes por capa.
const AURA_LAYERS = [
  { scale: 1, fill: "url(#bsd-ki-fill)", shapes: [auraPath(3), auraPath(11), auraPath(29)] },
  { scale: 0.85, fill: "url(#bsd-ki-mid)", shapes: [auraPath(41), auraPath(53), auraPath(67)] },
];

/** Rayo de punta afilada (lo usa la estela de la cápsula). */
export function blade(w, len) {
  return `M${-w} 0Q${-w * 0.7} ${-len * 0.55} 0 ${-len}Q${w * 0.9} ${-len * 0.5} ${w} 0Z`;
}

/** Aura de ki dorada detrás de la foto. Sólo transform/opacity; quieta (una sola silueta por capa) con `data-calm`. */
export function Aura({ className = "" }) {
  return (
    <svg className={`bsd-aura ${className}`} viewBox="-110 -170 220 300" aria-hidden="true">
      <defs>
        <radialGradient id="bsd-ki-fill" cx=".5" cy=".62" r=".62">
          <stop offset="0" stopColor="#fffcc8" stopOpacity=".85" />
          <stop offset=".5" stopColor="#fff56a" stopOpacity=".92" />
          <stop offset="1" stopColor="#ffe600" />
        </radialGradient>
        <radialGradient id="bsd-ki-mid" cx=".5" cy=".7" r=".7">
          <stop offset="0" stopColor="#fffde0" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff36a" />
        </radialGradient>
      </defs>
      {AURA_LAYERS.map(({ scale, fill, shapes }, i) => (
        <g key={i} transform={`translate(0 ${AURA_BOTTOM}) scale(${scale}) translate(0 ${-AURA_BOTTOM})`} stroke="#e0b400" strokeWidth={0.9 / scale} strokeLinejoin="miter" fill={fill}>
          <path d={shapes[0]} />
          <path className="bsd-aura__frame bsd-aura__frame--a" d={shapes[1]} />
          <path className="bsd-aura__frame bsd-aura__frame--b" d={shapes[2]} />
        </g>
      ))}
    </svg>
  );
}

export default DragonBall;
