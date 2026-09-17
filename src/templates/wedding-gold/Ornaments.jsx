// Filigranas doradas de la plantilla. SVG inline: heredan el color y no pesan.

export function Corner({ className = "" }) {
  return (
    <svg className={`wg-corner ${className}`} viewBox="0 0 120 120" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 117V41C3 20 20 3 41 3h76" strokeWidth="1.4" />
      <path d="M13 117V45c0-18 14-32 32-32h72" strokeWidth="0.7" opacity=".65" />
      <path d="M13 74c16 3 28-6 31-22 2-10-5-17-12-15-8 2-11 11-6 18 6 9 19 11 31 5 11-5 18-15 20-27" strokeWidth="1.1" />
      <path d="M45 13c1 12 9 20 22 21" strokeWidth="0.9" opacity=".8" />
      <path d="M22 96c10-2 16-8 18-18" strokeWidth="0.9" opacity=".8" />
      <circle cx="31" cy="31" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="67" cy="13" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="67" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Divider({ className = "" }) {
  return (
    <svg className={`wg-divider ${className}`} viewBox="0 0 260 26" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M6 13h86M168 13h86" strokeWidth="1" />
      <path d="M130 2c9 5 13 9 13 11s-4 6-13 11c-9-5-13-9-13-11s4-6 13-11Z" strokeWidth="1.1" />
      <path d="M130 6v14" strokeWidth="0.7" opacity=".7" />
      <circle cx="104" cy="13" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="156" cy="13" r="2.2" fill="currentColor" stroke="none" />
      <path d="M92 13c4-4 8-5 12-3M168 13c-4-4-8-5-12-3" strokeWidth="0.8" opacity=".8" />
    </svg>
  );
}

export function Leaves({ className = "" }) {
  return (
    <svg className={`wg-leaves ${className}`} viewBox="0 0 200 260" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".9">
        <path d="M30 250C50 190 70 130 120 80" />
        <path d="M46 214C40 176 58 150 92 140" />
        <path d="M70 158C88 120 128 106 160 118" />
      </g>
      <g fill="currentColor">
        {[
          [44, 214, -30], [60, 186, -18], [76, 156, -8], [96, 126, 6], [116, 98, 16], [134, 76, 28],
          [38, 236, -46], [58, 206, 24], [80, 178, 40], [104, 150, 52], [126, 124, 62],
          [96, 140, -34], [120, 120, -22], [146, 110, -8], [166, 116, 8],
        ].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={i % 2 ? 11 : 13} ry={i % 2 ? 15 : 18} opacity={i % 3 === 0 ? 0.55 : 0.85} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
    </svg>
  );
}

export function Ring({ className = "" }) {
  return (
    <svg className={`wg-ring ${className}`} viewBox="0 0 64 44" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="24" cy="27" r="14" strokeWidth="2" />
      <circle cx="41" cy="27" r="14" strokeWidth="2" />
      <path d="M20 12 24 4h9l4 8" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
