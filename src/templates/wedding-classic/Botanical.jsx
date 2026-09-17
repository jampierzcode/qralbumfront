// Marco botánico dorado y hojas sueltas. SVG inline: heredan el color.

export function Frame({ className = "" }) {
  return (
    <svg className={`wc-frame ${className}`} viewBox="0 0 320 420" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <rect x="10" y="10" width="300" height="400" rx="4" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <rect x="17" y="17" width="286" height="386" rx="3" stroke="currentColor" strokeWidth="0.6" opacity=".35" />
    </svg>
  );
}

/** Ramita de hojas: se usa en las esquinas del marco y como separador. */
export function Branch({ className = "" }) {
  const leaves = [
    [26, 118, -52], [44, 96, -34], [66, 76, -22], [92, 60, -10], [120, 50, 4], [148, 46, 14],
    [36, 132, 42], [58, 112, 54], [84, 94, 66], [112, 80, 74], [142, 72, 84],
  ];
  return (
    <svg className={`wc-branch ${className}`} viewBox="0 0 180 150" fill="none" aria-hidden="true">
      <path d="M12 140C40 118 78 88 168 44" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      <path d="M22 146C36 116 52 96 96 74" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
      {leaves.map(([x, y, r], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={i % 2 ? 7 : 9}
          ry={i % 2 ? 13 : 16}
          fill="currentColor"
          opacity={i % 3 === 0 ? 0.42 : 0.7}
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
      <circle cx="168" cy="44" r="3.4" fill="currentColor" opacity=".8" />
    </svg>
  );
}

export function Chevron({ className = "" }) {
  return (
    <svg className={`wc-chevron ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}
