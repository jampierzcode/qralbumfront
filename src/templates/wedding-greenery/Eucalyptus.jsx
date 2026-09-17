// Eucalipto de la plantilla: arco para el save the date y ramas de esquina.

function leaves(points, rx = 9, ry = 13) {
  return points.map(([x, y, r], i) => (
    <ellipse
      key={i}
      cx={x}
      cy={y}
      rx={i % 2 ? rx : rx + 2}
      ry={i % 2 ? ry : ry + 3}
      fill="currentColor"
      opacity={i % 3 === 0 ? 0.55 : 0.85}
      transform={`rotate(${r} ${x} ${y})`}
    />
  ));
}

/** Arco de hojas que enmarca el save the date. */
export function Arch({ className = "" }) {
  const points = [];
  const total = 26;
  for (let i = 0; i < total; i++) {
    const t = i / (total - 1);
    const angle = Math.PI + t * Math.PI; // de izquierda a derecha por arriba
    const x = 150 + Math.cos(angle) * 134;
    const y = 200 + Math.sin(angle) * 176;
    const deg = (angle * 180) / Math.PI + (i % 2 ? 108 : 62);
    points.push([Number(x.toFixed(1)), Number(y.toFixed(1)), Number(deg.toFixed(1))]);
  }
  return (
    // preserveAspectRatio="none": el arco se estira hasta los bordes de la tarjeta,
    // así las hojas rodean el texto en lugar de cruzarlo.
    <svg className={`wgr-arch ${className}`} viewBox="0 0 300 380" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <path d="M16 380C16 116 80 16 150 16s134 100 134 364" stroke="currentColor" strokeWidth="1.2" opacity=".3" vectorEffect="non-scaling-stroke" />
      {leaves(points, 9, 11)}
    </svg>
  );
}

/** Rama suelta para las esquinas. */
export function Branch({ className = "" }) {
  const points = [
    [26, 130, -58], [44, 108, -40], [64, 88, -28], [88, 70, -14], [114, 58, 2], [142, 52, 14],
    [40, 146, 40], [62, 126, 52], [88, 108, 64], [116, 94, 74], [146, 84, 84],
  ];
  return (
    <svg className={`wgr-branch ${className}`} viewBox="0 0 180 170" fill="none" aria-hidden="true">
      <path d="M10 160C40 132 78 98 168 50" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
      <path d="M22 166C38 136 56 112 100 86" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".5" />
      {leaves(points)}
    </svg>
  );
}

/** Monograma J|J dentro de un filete fino. */
export function Monogram({ text, className = "" }) {
  return (
    <span className={`wgr-monogram ${className}`} aria-hidden="true">
      {text}
    </span>
  );
}
