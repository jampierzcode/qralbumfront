// El ramo: los carritos hacen de flores y crecen desde el papel.
// Cada carrito es un botón que abre su mensaje; en la portada (dim) sólo se ve la silueta.
import Photo from "../../experience-kit/Photo.jsx";

/**
 * Rosa de satén: la cinta enrollada en espiral, con las sombras entre pliegues
 * y un brillo arriba a la izquierda. Es como se ven las rosas de tela del ramo real.
 */
function Rose({ cx, cy, r, seed = 0 }) {
  const n = (v) => Number(v.toFixed(1));
  const start = (seed * Math.PI) / 180;

  const spiral = (from, to, steps = 54) => {
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const k = i / steps;
      const t = start + k * 2.7 * Math.PI * 2;
      const rad = r * (from + k * (to - from));
      d += `${i === 0 ? "M" : " L"}${n(cx + Math.cos(t) * rad)} ${n(cy + Math.sin(t) * rad * 0.95)}`;
    }
    return d;
  };

  const path = spiral(0.12, 0.84);

  return (
    <g>
      {/* lóbulos del borde: rompen el círculo perfecto */}
      {[18, 90, 162, 234, 306].map((a) => {
        const t = ((a + seed) * Math.PI) / 180;
        return (
          <circle
            key={a}
            cx={n(cx + Math.cos(t) * r * 0.72)}
            cy={n(cy + Math.sin(t) * r * 0.68)}
            r={n(r * 0.34)}
            fill="url(#cb-rose-out)"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={n(r * 0.86)} fill="url(#cb-rose-out)" />
      {/* pliegues: primero la sombra, encima la cinta */}
      <path d={path} fill="none" stroke="var(--cb-rose-dark)" strokeWidth={n(r * 0.33)} strokeLinecap="round" />
      <path d={path} fill="none" stroke="url(#cb-rose-mid)" strokeWidth={n(r * 0.19)} strokeLinecap="round" />
      {/* brillo de satén */}
      <path
        d={`M${n(cx - r * 0.56)} ${n(cy - r * 0.34)} A ${n(r * 0.66)} ${n(r * 0.66)} 0 0 1 ${n(cx - r * 0.06)} ${n(cy - r * 0.68)}`}
        fill="none"
        stroke="#fff"
        strokeWidth={n(r * 0.1)}
        strokeLinecap="round"
        opacity=".3"
      />
      <ellipse cx={n(cx + r * 0.06)} cy={n(cy - r * 0.04)} rx={n(r * 0.14)} ry={n(r * 0.12)} fill="var(--cb-rose-light)" opacity=".55" />
    </g>
  );
}

/** Papel negro, domo de rosas y moño de satén (SVG; los colores salen del tema). */
function Wrap() {
  // Domo de rosas: de atrás hacia adelante para que se vean superpuestas.
  const dome = [
    // anillo exterior
    ...Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + 0.28;
      return { cx: 160 + Math.cos(a) * 114, cy: 152 + Math.sin(a) * 66, r: 24, seed: i * 27 };
    }),
    // anillo intermedio
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + 0.75;
      return { cx: 160 + Math.cos(a) * 76, cy: 150 + Math.sin(a) * 44, r: 25, seed: i * 41 + 15 };
    }),
    // anillo interior
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 1.4;
      return { cx: 160 + Math.cos(a) * 38, cy: 146 + Math.sin(a) * 22, r: 24, seed: i * 53 + 9 };
    }),
    { cx: 150, cy: 140, r: 25, seed: 7 },
    { cx: 176, cy: 150, r: 24, seed: 53 },
  ];

  // Hojas de papel negro que abren detrás del ramo.
  const sheets = [
    "M160 206 L26 96 L4 142 L114 222Z",
    "M160 206 L294 96 L316 142 L206 222Z",
    "M160 206 L58 44 L104 34 L156 160Z",
    "M160 206 L262 44 L216 34 L164 160Z",
    "M160 210 L120 68 L152 58 L166 170Z",
    "M160 210 L200 68 L168 58 L154 170Z",
    "M160 214 L6 198 L16 244 L132 234Z",
    "M160 214 L314 198 L304 244 L188 234Z",
  ];

  return (
    <svg className="cb-wrap" viewBox="0 0 320 340" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="cb-rose-out" cx=".34" cy=".28" r=".8">
          <stop offset="0" stopColor="var(--cb-rose-light)" />
          <stop offset=".4" stopColor="var(--cb-rose)" />
          <stop offset=".78" stopColor="var(--cb-rose-dark)" />
          <stop offset="1" stopColor="var(--cb-rose-dark)" />
        </radialGradient>
        <radialGradient id="cb-rose-mid" cx=".38" cy=".3" r=".72">
          <stop offset="0" stopColor="var(--cb-rose-light)" />
          <stop offset=".62" stopColor="var(--cb-rose)" />
          <stop offset="1" stopColor="var(--cb-rose)" />
        </radialGradient>
        <linearGradient id="cb-sheet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cb-paper-light)" />
          <stop offset=".5" stopColor="var(--cb-paper)" />
          <stop offset="1" stopColor="var(--cb-paper-dark)" />
        </linearGradient>
        <linearGradient id="cb-cone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--cb-paper-dark)" />
          <stop offset=".42" stopColor="var(--cb-paper-light)" />
          <stop offset=".6" stopColor="var(--cb-paper)" />
          <stop offset="1" stopColor="var(--cb-paper-dark)" />
        </linearGradient>
        <linearGradient id="cb-satin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cb-ribbon-light)" />
          <stop offset=".45" stopColor="var(--cb-ribbon)" />
          <stop offset="1" stopColor="var(--cb-ribbon-dark)" />
        </linearGradient>
      </defs>

      {/* papel negro abierto en puntas detrás del ramo */}
      <g className="cb-wrap__sheets">
        {sheets.map((d, i) => (
          <path key={i} d={d} fill="url(#cb-sheet)" stroke="rgba(255,255,255,.1)" strokeWidth="1" opacity={i % 2 ? 0.94 : 1} />
        ))}
      </g>

      {/* domo de rosas */}
      <g className="cb-wrap__roses">
        {dome.map((rose, i) => (
          <Rose key={i} {...rose} />
        ))}
      </g>

      {/* cono de papel negro */}
      <path d="M76 202 L244 202 L188 330 Q160 342 132 330 Z" fill="url(#cb-cone)" />
      <path d="M76 202 Q160 188 244 202 Q160 224 76 202Z" fill="var(--cb-paper-dark)" opacity=".9" />
      <g stroke="var(--cb-paper-dark)" strokeWidth="1.4" opacity=".55">
        <path d="M100 212 L142 330" />
        <path d="M160 214 L160 336" />
        <path d="M220 212 L178 330" />
      </g>
      <path d="M128 216 L148 214 L138 330 L130 332Z" fill="#fff" opacity=".07" />

      {/* tul con brillos */}
      <g className="cb-wrap__glitter" fill="#fff">
        {[
          [68, 206, 1.6], [96, 232, 1.2], [128, 214, 1], [150, 252, 1.5], [180, 224, 1.1], [206, 248, 1.4],
          [238, 208, 1.3], [112, 278, 1.2], [196, 288, 1], [160, 306, 1.4], [84, 250, 1], [252, 232, 1.1],
          [58, 176, 1.2], [268, 174, 1.3], [142, 300, 1], [176, 268, 1.2],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} opacity={i % 3 === 0 ? 0.85 : 0.5} />
        ))}
      </g>

      {/* moño de satén */}
      <g className="cb-wrap__bow" transform="translate(22 22) scale(0.86)">
        <path d="M160 244 C 112 210, 70 242, 104 272 C 126 290, 152 268, 160 244Z" fill="url(#cb-satin)" />
        <path d="M160 244 C 208 210, 250 242, 216 272 C 194 290, 168 268, 160 244Z" fill="url(#cb-satin)" />
        <path d="M160 244 C 132 228, 104 236, 102 254 C 124 244, 146 246, 160 244Z" fill="var(--cb-ribbon-dark)" opacity=".65" />
        <path d="M160 244 C 188 228, 216 236, 218 254 C 196 244, 174 246, 160 244Z" fill="var(--cb-ribbon-dark)" opacity=".65" />
        <path d="M150 254 C 140 284, 122 310, 108 328 L 142 322 C 150 296, 154 272, 156 256Z" fill="url(#cb-satin)" />
        <path d="M170 254 C 180 284, 198 310, 212 328 L 178 322 C 170 296, 166 272, 164 256Z" fill="url(#cb-satin)" />
        <circle cx="160" cy="246" r="13" fill="var(--cb-ribbon-light)" />
        <circle cx="156" cy="242" r="5" fill="#fff" opacity=".45" />
      </g>
    </svg>
  );
}

/**
 * @param {{ cars: Array<{photo?: object, name?: string}>, onOpen?: (i:number)=>void,
 *           discovered?: number[], dim?: boolean, growing?: boolean }} props
 */
export default function Bouquet({ cars = [], onOpen, discovered = [], dim = false, growing = false }) {
  const total = cars.length;
  const spread = total > 7 ? 15 : total > 5 ? 22 : 26;

  return (
    <div className={`cb-bouquet${dim ? " cb-bouquet--dim" : ""}`} data-growing={growing ? "true" : undefined}>
      <div className="cb-bouquet__glow" aria-hidden="true" />
      <div className="cb-bouquet__fan">
        {cars.map((car, i) => {
          const angle = (i - (total - 1) / 2) * spread;
          // Filas alternas: las pares van al frente y un poco más cortas.
          const row = i % 2;
          const style = { "--a": angle, "--i": i, "--row": row };
          const found = discovered.includes(i);

          const inner = (
            <>
              <span className="cb-car__stem" aria-hidden="true" />
              <span className="cb-car__photo">
                <Photo image={car.photo} sizes="(min-width: 900px) 18vw, 34vw" loading={i < 3 ? "eager" : "lazy"} fit="contain" />
              </span>
              {!dim && <span className="cb-car__tag" aria-hidden="true">{found ? "✓" : "+"}</span>}
            </>
          );

          if (dim) {
            return (
              <span key={i} className="cb-car" style={style} aria-hidden="true">
                {inner}
              </span>
            );
          }
          return (
            <button
              key={i}
              type="button"
              className={`cb-car${found ? " cb-car--found" : ""}`}
              style={style}
              onClick={() => onOpen?.(i)}
              aria-label={car.name ? `Abrir el mensaje de ${car.name}` : `Abrir el mensaje del carrito ${i + 1}`}
            >
              {inner}
            </button>
          );
        })}
      </div>
      <Wrap />
    </div>
  );
}
