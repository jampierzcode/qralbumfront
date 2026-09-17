// El ramo: los carritos hacen de flores y crecen desde el papel.
// Cada carrito es un botón que abre su mensaje; en la portada (dim) sólo se ve la silueta.
import Photo from "../../experience-kit/Photo.jsx";

/** Papel de regalo, moño y florecitas (todo SVG, hereda los colores del tema). */
function Wrap() {
  const flower = (cx, cy, r, i) => (
    <g key={`${cx}-${cy}`}>
      {Array.from({ length: 5 }, (_, p) => (
        <ellipse
          key={p}
          cx={cx}
          cy={cy - r * 0.58}
          rx={r * 0.46}
          ry={r * 0.62}
          fill={p % 2 ? "var(--cb-petal)" : "var(--cb-petal-2)"}
          transform={`rotate(${p * 72 + i * 13} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.24} fill="var(--cb-pollen)" />
    </g>
  );

  return (
    <svg className="cb-wrap" viewBox="0 0 320 300" fill="none" aria-hidden="true">
      {/* hojas largas que asoman por detrás del papel */}
      <g className="cb-wrap__leaves">
        {[
          [58, 96, -46], [262, 96, 46], [34, 128, -70], [286, 128, 70], [92, 72, -24], [228, 72, 24], [160, 62, 0],
        ].map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="14"
            ry={i > 4 ? 46 : 40}
            fill="var(--cb-leaf)"
            opacity={i % 2 ? 0.7 : 0.95}
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
      </g>

      {/* cono de papel: arriba ancho, abajo en punta */}
      <path d="M56 96 L264 96 L184 288 Q160 298 136 288 Z" fill="var(--cb-paper)" />
      {/* pliegue izquierdo y derecho para dar volumen */}
      <path d="M56 96 L160 124 L136 288 Q128 292 120 286 Z" fill="var(--cb-paper-dark)" opacity=".6" />
      <path d="M264 96 L160 124 L184 288 Q192 292 200 286 Z" fill="var(--cb-paper-light)" opacity=".45" />
      {/* boca del cono (lo que se ve del interior) */}
      <path d="M56 96 Q160 80 264 96 Q160 132 56 96Z" fill="var(--cb-paper-dark)" opacity=".75" />
      <path d="M56 96 Q160 80 264 96 Q160 120 56 96Z" fill="var(--cb-paper-light)" opacity=".45" />
      <g stroke="var(--cb-paper-dark)" strokeWidth="1.4" opacity=".4">
        <path d="M92 112 L146 288" />
        <path d="M160 126 L160 292" />
        <path d="M228 112 L174 288" />
      </g>
      {/* brillo del papel */}
      <path d="M118 132 L150 130 L134 286 L124 288Z" fill="#fff" opacity=".1" />

      {/* moño */}
      <g className="cb-wrap__bow">
        <path d="M160 206 C 112 172, 74 204, 106 232 C 126 248, 152 230, 160 206Z" fill="var(--cb-ribbon)" />
        <path d="M160 206 C 208 172, 246 204, 214 232 C 194 248, 168 230, 160 206Z" fill="var(--cb-ribbon)" />
        <path d="M160 206 C 132 190, 106 198, 104 214 C 124 206, 146 208, 160 206Z" fill="var(--cb-ribbon-dark)" opacity=".7" />
        <path d="M160 206 C 188 190, 214 198, 216 214 C 196 206, 174 208, 160 206Z" fill="var(--cb-ribbon-dark)" opacity=".7" />
        <path d="M152 214 C 142 244, 126 268, 112 284 L 144 278 C 152 254, 156 232, 158 216Z" fill="var(--cb-ribbon-dark)" />
        <path d="M168 214 C 178 244, 194 268, 208 284 L 176 278 C 168 254, 164 232, 162 216Z" fill="var(--cb-ribbon-dark)" />
        <circle cx="160" cy="208" r="13" fill="var(--cb-ribbon-light)" />
      </g>

      {/* florecitas del relleno, asomando sobre el papel */}
      <g className="cb-wrap__flowers">
        {[
          [70, 74, 19], [250, 74, 18], [112, 58, 15], [208, 58, 16], [42, 106, 13], [278, 106, 13], [160, 50, 14],
        ].map(([x, y, r], i) => flower(x, y, r, i))}
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
