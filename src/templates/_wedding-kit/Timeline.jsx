// Itinerario del día: hora + momento.
import { formatTime } from "./format.js";

export default function Timeline({ items = [], className = "" }) {
  const rows = items.filter((item) => item?.title || item?.time);
  if (!rows.length) return null;
  return (
    <ol className={`wk-timeline ${className}`}>
      {rows.map((item, i) => (
        <li key={i} className="wk-timeline__row">
          <span className="wk-timeline__time">{formatTime(item.time)}</span>
          <span className="wk-timeline__dot" aria-hidden="true" />
          <span className="wk-timeline__body">
            <strong>{item.title}</strong>
            {item.note && <span>{item.note}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
