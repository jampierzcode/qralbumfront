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

export default DragonBall;
