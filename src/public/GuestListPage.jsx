import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicRequest } from "../lib/publicApi.js";
import "../portal/portal.css";
import "./guest-list.css";

const ANSWERS = {
  yes: { label: "Va", tone: "yes" },
  maybe: { label: "Tal vez", tone: "maybe" },
  no: { label: "No va", tone: "no" },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  const text = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(d);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** /lista/:token — quien compró la invitación ve cómo va su lista. Sin cuenta, sólo lectura. */
export default function GuestListPage() {
  const { token } = useParams();
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let alive = true;
    const load = () =>
      publicRequest(`/public/guest-list/${encodeURIComponent(token)}`)
        .then((data) => alive && setState({ status: "ready", data }))
        .catch((error) => alive && setState({ status: "error", error }));
    load();
    // Se refresca al volver a la pestaña: la lista cambia mientras la gente confirma.
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="pt gl">
        <div className="pt__inner gl__inner">
          <p className="gl__muted">Cargando tu lista…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="pt gl">
        <div className="pt__inner gl__inner">
          <h1 className="gl__title">No pudimos abrir esta lista</h1>
          <p className="gl__muted">{state.error?.message || "Puede que el link haya cambiado. Pídeselo a quien te lo envió."}</p>
        </div>
      </div>
    );
  }

  const { gift, summary, items } = state.data;
  const total = summary.yes + summary.maybe + summary.no;

  return (
    <div className="pt gl">
      <div className="pt__inner gl__inner">
        <header className="gl__head">
          <p className="gl__eyebrow">Lista de confirmaciones</p>
          <h1 className="gl__title">{gift.recipientName ? `Fiesta de ${gift.recipientName}` : gift.templateName}</h1>
          {(gift.eventDate || gift.venueName) && (
            <p className="gl__muted">
              {[formatDate(gift.eventDate), gift.eventTime, gift.venueName].filter(Boolean).join(" · ")}
            </p>
          )}
        </header>

        <div className="gl__stats">
          <div className="gl__stat gl__stat--yes">
            <span className="gl__stat-value">{summary.guestsYes}</span>
            <span className="gl__stat-label">personas van</span>
          </div>
          <div className="gl__stat">
            <span className="gl__stat-value">{summary.guestsMaybe}</span>
            <span className="gl__stat-label">tal vez</span>
          </div>
          <div className="gl__stat">
            <span className="gl__stat-value">{summary.no}</span>
            <span className="gl__stat-label">no van</span>
          </div>
        </div>

        {total === 0 ? (
          <p className="gl__muted gl__empty">Todavía nadie confirma. Comparte tu invitación y vuelve a entrar a este link.</p>
        ) : (
          <ul className="gl__list">
            {items.map((r) => (
              <li key={r.id} className="gl__item">
                <div>
                  <span className="gl__name">{r.name}</span>
                  {r.message && <span className="gl__message">“{r.message}”</span>}
                </div>
                <div className="gl__answer">
                  <span className={`gl__badge gl__badge--${ANSWERS[r.answer].tone}`}>{ANSWERS[r.answer].label}</span>
                  {r.answer !== "no" && <span className="gl__guests">{r.guests === 1 ? "1 persona" : `${r.guests} personas`}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="gl__foot">
          {total > 0 && `${total} ${total === 1 ? "respuesta" : "respuestas"} · `}Esta lista se actualiza sola.
        </p>
      </div>
    </div>
  );
}
