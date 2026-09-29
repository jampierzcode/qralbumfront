// Las esferas del dragón y el dragón, dibujados en SVG propio (sin imágenes ni logos de terceros).
// Cada esfera es una bola naranja con sus estrellas rojas; el dragón es una serpiente larga y verde.

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

// Cuerpo del dragón: una S larga que sube desde abajo. Se dibuja en 3 capas para dar volumen.
const BODY = "M210 1180C60 1080 40 960 150 880S330 760 220 660 70 520 200 420 300 300 240 210";

/** Dragón serpentino que se eleva; la cabeza queda arriba. */
export function Dragon({ className = "" }) {
  return (
    <svg className={`bsd-dragon ${className}`} viewBox="0 20 420 800" aria-hidden="true">
      <defs>
        <linearGradient id="bsd-dragon-skin" x1="0" x2="1">
          <stop offset="0" stopColor="#2f9a5a" />
          <stop offset=".55" stopColor="#5fce7e" />
          <stop offset="1" stopColor="#2b8a52" />
        </linearGradient>
      </defs>
      {/* sombra, piel y vientre */}
      <path d={BODY} fill="none" stroke="#1d6b3d" strokeWidth="86" strokeLinecap="round" opacity=".9" />
      <path d={BODY} fill="none" stroke="url(#bsd-dragon-skin)" strokeWidth="72" strokeLinecap="round" />
      <path d={BODY} fill="none" stroke="#ffeaa0" strokeWidth="22" strokeLinecap="round" strokeDasharray="6 26" opacity=".85" />
      <path d={BODY} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".18" transform="translate(-18 0)" />
      {/* espinas rojas a lo largo del lomo */}
      <g fill="#e4453a" stroke="#b02a22" strokeWidth="3" strokeLinejoin="round">
        <path d="M250 1130l32-14-10 34Z" />
        <path d="M118 930l-30-18 6 36Z" />
        <path d="M290 790l34-4-18 28Z" />
        <path d="M112 630l-32-12 8 34Z" />
        <path d="M286 480l34-10-16 30Z" />
      </g>
      {/* cabeza */}
      <g transform="translate(240 190)">
        <path d="M-64 20C-70-30-30-64 20-62c46 2 86 24 96 56 6 20-8 38-30 44-30 8-60 4-86 10-16 4-30 0-34-28Z" fill="#4fbf70" stroke="#1d6b3d" strokeWidth="5" />
        <path d="M-6 26c30 14 76 14 110-2 4 24-14 42-40 46-28 4-56-4-70-44Z" fill="#ffeaa0" />
        <path d="M-40-52c-16-38-8-70 12-92-2 30 8 50 28 64Z" fill="#f5b942" stroke="#b9781a" strokeWidth="4" strokeLinejoin="round" />
        <path d="M18-60c8-40 34-64 62-72-10 26-8 48 2 70Z" fill="#f5b942" stroke="#b9781a" strokeWidth="4" strokeLinejoin="round" />
        <path d="M-68 26c-30 6-54 26-58 52 22-8 40-8 58-2Z" fill="#e4453a" />
        <path d="M-60 30c-40 22-70 60-70 100 22-20 44-40 70-52Z" fill="#e4453a" opacity=".85" />
        <ellipse cx="34" cy="-8" rx="22" ry="20" fill="#fff" />
        <circle cx="38" cy="-6" r="13" fill="#d3261f" />
        <circle cx="40" cy="-6" r="6" fill="#2a0a0a" />
        <circle cx="34" cy="-12" r="4" fill="#fff" />
        <path d="M14-32q22-12 42-2" fill="none" stroke="#1d6b3d" strokeWidth="6" strokeLinecap="round" />
        <circle cx="98" cy="-2" r="5" fill="#1d6b3d" />
        <path d="M94 34q18 6 34 26" fill="none" stroke="#e4453a" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 40q26 10 30-6" fill="none" stroke="#1d6b3d" strokeWidth="4" strokeLinecap="round" opacity=".5" />
      </g>
    </svg>
  );
}

export default DragonBall;
