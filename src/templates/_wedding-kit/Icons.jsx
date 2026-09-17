// Iconos de línea compartidos por las invitaciones de boda.
// Heredan el color (stroke="currentColor") y el tamaño se controla por CSS.

const PATHS = {
  rings: (
    <>
      <circle cx="9.5" cy="14.5" r="6" />
      <circle cx="15.5" cy="14.5" r="6" />
      <path d="M8 6.5 9.5 3h5L16 6.5" />
    </>
  ),
  church: (
    <>
      <path d="M12 2v6M9.5 4.5h5" />
      <path d="M4 21V11l8-4 8 4v10" />
      <path d="M10 21v-5a2 2 0 0 1 4 0v5" />
    </>
  ),
  glass: (
    <>
      <path d="M6 3h12l-1.5 6a4.5 4.5 0 0 1-9 0Z" />
      <path d="M12 13v6M9 21h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  dress: (
    <>
      <path d="M9 3h6l-1.2 3.4L15 9l-3 2-3-2 1.2-2.6Z" />
      <path d="M9.6 10.6 6 21h12l-3.6-10.4" />
    </>
  ),
  camera: (
    <>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2L9 4h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5Z" />
      <circle cx="12" cy="13" r="3.6" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M3 13h18M12 9v12" />
      <path d="M12 9S9.5 3 7.5 4.5 10 9 12 9Zm0 0s2.5-6 4.5-4.5S14 9 12 9Z" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-9.5A4.2 4.2 0 0 1 12 7.8a4.2 4.2 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z" />,
  envelope: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.6 6.8 8.4 6 8.4-6" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.8 0 1.3-.6 1.3-1.2l-1.6-.8-.9 1a5 5 0 0 1-2.8-2.8l1-.9-.8-1.6c-.6 0-1.7.4-1.7 1.8Z" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  check: <path d="m4 12.5 5 5L20 6.5" />,
};

export default function Icon({ name, className = "" }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg className={`wk-icon wk-icon--${name} ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {path}
    </svg>
  );
}
