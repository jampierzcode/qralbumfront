// Acuarelas azules y sello de cera de la plantilla. Todo SVG inline.

function Bloom({ cx, cy, r, tone = 0, seed = 0 }) {
  const petals = ["#9db9e2", "#7fa0d0", "#c3d6f0"];
  const petal = petals[tone % petals.length];
  const edge = petals[(tone + 1) % petals.length];
  return (
    <g>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - r * 0.62}
          rx={r * 0.52}
          ry={r * 0.74}
          fill={i % 2 ? petal : edge}
          transform={`rotate(${i * 72 + seed} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.26} fill="#e8d3a0" />
    </g>
  );
}

function Sprig({ x, y, angle = 0, length = 90, leaf = 11 }) {
  const rad = (angle * Math.PI) / 180;
  const ex = x + Math.cos(rad) * length;
  const ey = y + Math.sin(rad) * length;
  return (
    <g>
      <path d={`M${x} ${y} L${ex} ${ey}`} stroke="#5d7ead" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i + 1) / 7;
        const px = x + (ex - x) * t;
        const py = y + (ey - y) * t;
        const side = i % 2 ? 1 : -1;
        const ox = -Math.sin(rad) * side * leaf;
        const oy = Math.cos(rad) * side * leaf;
        return (
          <ellipse
            key={i}
            cx={px + ox}
            cy={py + oy}
            rx={leaf * 0.6}
            ry={leaf}
            fill={i % 2 ? "#6f90c4" : "#8fadd8"}
            transform={`rotate(${angle + side * 62} ${px + ox} ${py + oy})`}
          />
        );
      })}
    </g>
  );
}

/** Ramillete de acuarelas. `variant` cambia la composición para cada esquina. */
export function Blooms({ className = "", variant = "a" }) {
  const groups = {
    a: (
      <>
        <Sprig x={40} y={150} angle={-62} length={120} />
        <Sprig x={120} y={70} angle={-10} length={95} leaf={9} />
        <Bloom cx={70} cy={60} r={40} tone={0} seed={8} />
        <Bloom cx={130} cy={118} r={30} tone={1} seed={24} />
        <Bloom cx={28} cy={116} r={24} tone={2} seed={40} />
        <Bloom cx={168} cy={54} r={22} tone={1} seed={12} />
      </>
    ),
    b: (
      <>
        <Sprig x={160} y={40} angle={128} length={120} />
        <Sprig x={70} y={130} angle={190} length={90} leaf={9} />
        <Bloom cx={130} cy={130} r={42} tone={1} seed={16} />
        <Bloom cx={66} cy={70} r={28} tone={0} seed={32} />
        <Bloom cx={168} cy={70} r={22} tone={2} seed={4} />
        <Bloom cx={40} cy={140} r={20} tone={1} seed={48} />
      </>
    ),
  };
  return (
    <svg className={`wn-blooms ${className}`} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {groups[variant] || groups.a}
    </svg>
  );
}

/** Sello de cera con las iniciales de los novios. */
export function WaxSeal({ initials = "", className = "" }) {
  return (
    <svg className={`wn-wax ${className}`} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="wn-wax-g" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="var(--wn-wax-light, #e7c98a)" />
          <stop offset=".6" stopColor="var(--wn-wax-mid, #c7a86a)" />
          <stop offset="1" stopColor="var(--wn-wax-dark, #8d7440)" />
        </radialGradient>
      </defs>
      <path
        className="wn-wax__blob"
        d="M60 6c14-4 27 6 33 17 6 10 21 12 21 26 0 12-11 17-13 28-2 12 4 25-6 32-10 6-20-3-32-3s-23 9-33 2c-10-8-3-21-6-33C22 65 8 59 8 47c0-13 14-16 20-26C34 11 46 2 60 6Z"
        fill="url(#wn-wax-g)"
      />
      <circle cx="60" cy="58" r="34" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.6" />
      <text className="wn-wax__text" x="60" y="58" textAnchor="middle" dominantBaseline="central">
        {initials}
      </text>
    </svg>
  );
}
