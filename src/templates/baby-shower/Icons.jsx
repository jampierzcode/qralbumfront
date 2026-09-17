// Iconos de bebé dibujados a mano en SVG (sin imágenes externas, heredan el color).
// Se usan en las tarjetas y también, en grande, como adornos que flotan en el fondo.

const GLYPHS = {
  crown: (
    <>
      <path d="M2.6 7.4 6.9 10.9 11.2 4.5a1 1 0 0 1 1.6 0l4.3 6.4 4.3-3.5a.9.9 0 0 1 1.4.9l-2 9.1a1 1 0 0 1-1 .8H4.2a1 1 0 0 1-1-.8l-2-9.1a.9.9 0 0 1 1.4-.9Z" />
      <circle cx="1.9" cy="6.1" r="1.6" />
      <circle cx="12" cy="2.6" r="1.7" />
      <circle cx="22.1" cy="6.1" r="1.6" />
      <rect x="4.4" y="19.4" width="15.2" height="2.6" rx="1.3" />
    </>
  ),
  bottle: (
    <>
      <path d="M12 .8c1.3 0 2.3 1 2.3 2.2 0 .9-.6 1.4-.8 2.2h-3c-.2-.8-.8-1.3-.8-2.2C9.7 1.8 10.7.8 12 .8Z" />
      <rect x="8.1" y="5.3" width="7.8" height="2.7" rx="1.35" />
      <path d="M7.7 9.9a1.6 1.6 0 0 1 1.6-1.6h5.4a1.6 1.6 0 0 1 1.6 1.6v9.5a3.4 3.4 0 0 1-3.4 3.4h-1.8a3.4 3.4 0 0 1-3.4-3.4V9.9Z" />
      <g fill="#fff" opacity=".55">
        <rect x="9.5" y="11.4" width="3.4" height="1.1" rx=".55" />
        <rect x="9.5" y="14" width="2.3" height="1.1" rx=".55" />
        <rect x="9.5" y="16.6" width="3.4" height="1.1" rx=".55" />
      </g>
    </>
  ),
  pacifier: (
    <>
      <circle cx="12" cy="8.4" r="5.6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="8.4" r="2.4" />
      <path d="M8.3 13.9h7.4a2.1 2.1 0 0 1 2.1 2.1v.7a5 5 0 0 1-5 5h-1.6a5 5 0 0 1-5-5V16a2.1 2.1 0 0 1 2.1-2.1Z" />
    </>
  ),
  rattle: (
    <>
      <circle cx="8.6" cy="8.2" r="6.1" />
      <circle cx="8.6" cy="8.2" r="2.3" fill="#fff" opacity=".55" />
      <path d="M13.1 12.2a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1-2.8 2.8l-5-5a2 2 0 0 1 0-2.8Z" />
      <circle cx="20.4" cy="20.2" r="2.8" />
    </>
  ),
  bear: (
    <>
      <circle cx="6.1" cy="6.3" r="3.4" />
      <circle cx="17.9" cy="6.3" r="3.4" />
      <circle cx="12" cy="13.2" r="8.3" />
      <g fill="#fff" opacity=".9">
        <circle cx="9" cy="11.6" r="1.1" />
        <circle cx="15" cy="11.6" r="1.1" />
        <ellipse cx="12" cy="16" rx="4.1" ry="3.3" opacity=".55" />
      </g>
      <ellipse cx="12" cy="14.9" rx="1.6" ry="1.2" />
    </>
  ),
  booties: (
    <>
      <ellipse cx="7.4" cy="14.9" rx="3.5" ry="4.6" transform="rotate(-12 7.4 14.9)" />
      <circle cx="4.4" cy="8.5" r="1.3" />
      <circle cx="7.2" cy="7.2" r="1.4" />
      <circle cx="10.1" cy="7.7" r="1.2" />
      <ellipse cx="16.6" cy="17.4" rx="3.1" ry="4.1" transform="rotate(10 16.6 17.4)" />
      <circle cx="14.2" cy="11.7" r="1.2" />
      <circle cx="16.9" cy="10.7" r="1.25" />
      <circle cx="19.5" cy="11.4" r="1.1" />
    </>
  ),
  stroller: (
    <>
      <path d="M12.6 2.2A9.8 9.8 0 0 1 22 12.1H3.2A9.8 9.8 0 0 1 12.6 2.2Z" />
      <rect x="1.9" y="12.7" width="20.2" height="2.5" rx="1.25" />
      <path d="M6.6 15.6 4.4 19.8M17.2 15.6l2.2 4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6.9" cy="20.8" r="2.2" />
      <circle cx="17.1" cy="20.8" r="2.2" />
    </>
  ),
  onesie: (
    <>
      <path d="M8.4 2h7.2l.5 2.1 3.9 1.5a1.4 1.4 0 0 1 .8 1.8l-1 2.6a1.4 1.4 0 0 1-1.9.8l-.9-.4V19a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-8.6l-.9.4a1.4 1.4 0 0 1-1.9-.8l-1-2.6A1.4 1.4 0 0 1 4 5.6l3.9-1.5L8.4 2Z" />
      <g fill="#fff" opacity=".5">
        <circle cx="12" cy="13.4" r="1" />
        <circle cx="12" cy="17" r="1" />
      </g>
    </>
  ),
  diaper: (
    <>
      <path d="M2.6 7h18.8a1.5 1.5 0 0 1 1.5 1.6c-.6 6.9-5 12-11 12S1.5 15.5.9 8.6A1.5 1.5 0 0 1 2.4 7Z" />
      <rect x="1" y="4.2" width="7.2" height="3.4" rx="1.7" />
      <rect x="15.8" y="4.2" width="7.2" height="3.4" rx="1.7" />
      <path d="M8.4 10.6c1.6 1.4 5.6 1.4 7.2 0" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".55" strokeLinecap="round" />
    </>
  ),
  blanket: (
    <>
      <rect x="2" y="4.4" width="20" height="12.8" rx="2.4" />
      <path d="M2 17.4c2.2 0 2.2 2.4 4.4 2.4s2.2-2.4 4.4-2.4 2.2 2.4 4.4 2.4 2.2-2.4 4.4-2.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <g fill="#fff" opacity=".5">
        <circle cx="8" cy="9" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="16" cy="9" r="1.2" />
      </g>
    </>
  ),
  wipes: (
    <>
      <rect x="2.2" y="6.8" width="19.6" height="12.6" rx="3.2" />
      <rect x="7.6" y="3.2" width="8.8" height="5.2" rx="2.4" fill="#fff" opacity=".55" />
      <path d="M9 12.4h6" fill="none" stroke="#fff" strokeWidth="1.7" opacity=".6" strokeLinecap="round" />
    </>
  ),
  moon: <path d="M20.6 15.3A9.1 9.1 0 0 1 8.7 3.4a9.1 9.1 0 1 0 11.9 11.9Z" />,
  star: <path d="m12 2.2 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.1l-5.9 3.1 1.2-6.5L2.5 9.1l6.6-.9 2.9-6Z" />,
  cloud: <path d="M6.9 19.2a5.1 5.1 0 0 1-.6-10.1A6.6 6.6 0 0 1 18.7 9.7a4.8 4.8 0 0 1-.6 9.5H6.9Z" />,
  balloon: (
    <>
      <ellipse cx="12" cy="8.6" rx="6" ry="7.2" />
      <path d="m12 15.6 1.7 2.4h-3.4L12 15.6Z" />
      <path d="M12 18.4c0 2 1.9 2 1.9 3.8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
  heart: <path d="M12 21.2S3.4 16 3.4 10.5A4.9 4.9 0 0 1 12 7.3a4.9 4.9 0 0 1 8.6 3.2c0 5.5-8.6 10.7-8.6 10.7Z" />,
  gift: (
    <>
      <path d="M12 6.7C11 4 9.6 2.3 7.8 2.3a2.4 2.4 0 0 0 0 4.9M12 6.7c1-2.7 2.4-4.4 4.2-4.4a2.4 2.4 0 0 1 0 4.9" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <rect x="1.6" y="6.7" width="20.8" height="4.5" rx="1.4" />
      <path d="M3 11.9h18v8.5a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 20.4v-8.5Z" />
      <rect x="10.4" y="6.7" width="3.2" height="15.3" fill="#fff" opacity=".45" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.2" y="5" width="17.6" height="16" rx="3.4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3.2 10.2h17.6M8.2 2.8v4.2M15.8 2.8v4.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8.4" cy="14.6" r="1.35" />
      <circle cx="12" cy="14.6" r="1.35" />
      <circle cx="15.6" cy="14.6" r="1.35" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6.4v5.9l3.9 2.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  pin: <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />,
};

export const GLYPH_NAMES = Object.keys(GLYPHS);

/** Icono de 24×24 que hereda el color del texto. */
export default function Icon({ name, className = "" }) {
  const glyph = GLYPHS[name];
  if (!glyph) return null;
  return (
    <svg className={`bsh-icon bsh-icon--${name} ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {glyph}
    </svg>
  );
}
