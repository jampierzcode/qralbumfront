// Bloque "Ceremonia" / "Recepción": hora, lugar, dirección y cómo llegar.
import Icon from "./Icons.jsx";
import { formatTime, mapsLink, wazeLink } from "./format.js";

export default function EventBlock({
  eyebrow,
  icon = "rings",
  time,
  venue,
  address,
  reference,
  mapsUrl,
  mapsLabel = "Cómo llegar",
  showWaze = true,
  className = "",
}) {
  if (!venue && !address && !time) return null;
  const maps = mapsLink(venue, address, mapsUrl);
  const waze = wazeLink(venue, address);

  return (
    <article className={`wk-event ${className}`}>
      {icon && <Icon name={icon} className="wk-event__icon" />}
      {eyebrow && <p className="wk-event__eyebrow">{eyebrow}</p>}
      {time && <p className="wk-event__time">{formatTime(time)}</p>}
      {venue && <p className="wk-event__venue">{venue}</p>}
      {address && <p className="wk-event__address">{address}</p>}
      {reference && <p className="wk-event__reference">{reference}</p>}
      {maps && (
        <div className="wk-event__actions">
          <a className="wk-btn wk-btn--ghost" href={maps} target="_blank" rel="noreferrer">
            <Icon name="pin" />
            {mapsLabel}
          </a>
          {showWaze && waze && (
            <a className="wk-btn wk-btn--plain" href={waze} target="_blank" rel="noreferrer">
              Waze
            </a>
          )}
        </div>
      )}
    </article>
  );
}
