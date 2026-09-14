// Jardín de girasoles en CSS. Cada flor ≈ 20 nodos y sólo anima transform.
// Las posiciones/alturas por tamaño de pantalla viven en styles.css (composición adaptable).

const PETALS = Array.from({ length: 14 }, (_, i) => i);

function Sunflower({ slot }) {
  return (
    <div className={`yf-flower yf-flower--${slot}`} aria-hidden="true">
      <div className="yf-flower__stem">
        <span className="yf-leaf yf-leaf--left" />
        <span className="yf-leaf yf-leaf--right" />
      </div>
      <div className="yf-flower__head">
        <span className="yf-flower__glow" />
        <div className="yf-flower__ring yf-flower__ring--back">
          {PETALS.map((i) => (
            <span key={i} style={{ "--r": `${i * (360 / PETALS.length) + 12}deg` }} />
          ))}
        </div>
        <div className="yf-flower__ring">
          {PETALS.map((i) => (
            <span key={i} style={{ "--r": `${i * (360 / PETALS.length)}deg` }} />
          ))}
        </div>
        <span className="yf-flower__disc" />
      </div>
    </div>
  );
}

export default function Garden({ variant = "field", count = 7 }) {
  const slots = variant === "bouquet" ? [1, 2, 3] : Array.from({ length: count }, (_, i) => i + 1);
  return (
    <div className={`yf-garden yf-garden--${variant}`}>
      {slots.map((slot) => (
        <Sunflower key={slot} slot={slot} />
      ))}
    </div>
  );
}
