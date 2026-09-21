import { initial } from "./format.js";

/** Logo del partido (o su inicial si no lo subieron) dentro de un círculo. */
export function PartyLogo({ logo, partyName, className = "" }) {
  return (
    <span className={`pk-logo ${className}`} role="img" aria-label={partyName ? `Logo de ${partyName}` : "Logo del partido"}>
      {logo?.src ? <img src={logo.src} srcSet={logo.srcSet} sizes="96px" alt="" draggable={false} loading="eager" decoding="async" /> : <span>{initial(partyName) || "★"}</span>}
    </span>
  );
}

/** Logo + número: lo que el votante busca en la cédula. */
export default function PartyMark({ logo, partyName, number, className = "" }) {
  if (!logo?.src && !number && !partyName) return null;
  return (
    <span className={`pk-mark ${className}`}>
      <PartyLogo logo={logo} partyName={partyName} />
      {number && (
        <span className="pk-mark__number" aria-label={`Número ${number}`}>
          <small>N°</small>
          {number}
        </span>
      )}
    </span>
  );
}
