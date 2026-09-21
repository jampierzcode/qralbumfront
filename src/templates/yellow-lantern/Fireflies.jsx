import { useMemo } from "react";

// Semilla estable: las luciérnagas no cambian de sitio en cada render.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function build(count) {
  const r = rng(20240921);
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: 4 + r() * 92, // % del ancho
    y: 6 + r() * 88, // % del alto
    size: 9 + r() * 15, // px del halo
    dx: (r() - 0.5) * 22, // vw que recorre
    dy: (r() - 0.5) * 16, // vh que recorre
    drift: 9 + r() * 14, // s
    blink: 2.4 + r() * 3.4, // s
    delay: -r() * 12, // s
  }));
}

/**
 * Luciérnagas: puntos de luz que flotan y titilan. Sólo animan transform y opacity.
 * Con `calm` se quedan quietas (miniatura, "reducir movimiento").
 */
export default function Fireflies({ count = 18, active = true, calm = false }) {
  const items = useMemo(() => build(count), [count]);
  if (!count) return null;
  return (
    <div className="yl-fireflies" data-active={active ? "true" : undefined} data-calm={calm ? "true" : undefined} aria-hidden="true">
      {items.map((f) => (
        <span
          key={f.id}
          className="yl-firefly"
          style={{
            "--x": `${f.x}%`,
            "--y": `${f.y}%`,
            "--s": `${f.size}px`,
            "--dx": `${f.dx}vw`,
            "--dy": `${f.dy}vh`,
            "--drift": `${f.drift}s`,
            "--blink": `${f.blink}s`,
            "--delay": `${f.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
