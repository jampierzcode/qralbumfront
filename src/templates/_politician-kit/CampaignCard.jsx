import Photo from "../../experience-kit/Photo.jsx";
import Icon from "./Icons.jsx";
import { formatCampaignDate, formatTime } from "./format.js";
import { safeHttps } from "./networks.js";

function whenBadge(days) {
  if (days === null || days < 0) return "";
  if (days === 0) return "¡Hoy!";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

/** Una campaña (de `campaignList()`): portada, fecha, lugar, descripción y link de transmisión o video. */
export default function CampaignCard({ campaign, className = "" }) {
  const { kind, title, description, date, time, place, cover, streamUrl, days } = campaign;
  const upcoming = kind === "upcoming";
  const link = safeHttps(streamUrl);
  const badge = upcoming ? whenBadge(days) : "";
  const when = [formatCampaignDate(date), time && formatTime(time)].filter(Boolean).join(" · ");

  return (
    <article className={`pk-campaign pk-campaign--${kind} ${cover?.src ? "has-cover" : ""} ${className}`}>
      {cover?.src && (
        <div className="pk-campaign__cover">
          <Photo image={cover} sizes="(min-width: 760px) 460px, 92vw" alt="" />
          {badge && <span className="pk-campaign__badge">{badge}</span>}
        </div>
      )}
      <div className="pk-campaign__body">
        {!cover?.src && badge && <span className="pk-campaign__badge pk-campaign__badge--inline">{badge}</span>}
        {when && (
          <p className="pk-campaign__meta">
            <Icon name="calendar" />
            {when}
          </p>
        )}
        {title && <h3 className="pk-campaign__title">{title}</h3>}
        {place && (
          <p className="pk-campaign__meta">
            <Icon name="pin" />
            {place}
          </p>
        )}
        {description && <p className="pk-campaign__text">{description}</p>}
        {link && (
          <a className="pk-btn" href={link} target="_blank" rel="noopener noreferrer">
            <Icon name="play" />
            {upcoming ? "Ver transmisión" : "Ver video"}
          </a>
        )}
      </div>
    </article>
  );
}
