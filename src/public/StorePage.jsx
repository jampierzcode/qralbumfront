import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { publicRequest } from "../lib/publicApi.js";
import { getTemplate } from "../engine/registry.js";
import "../portal/portal.css";
import "./store.css";

const OCCASIONS = {
  amor: "Amor",
  aniversario: "Aniversario",
  cumpleanos: "Cumpleaños",
  amistad: "Amistad",
  "san-valentin": "San Valentín",
  "dia-de-la-madre": "Día de la madre",
  "flores-amarillas": "Flores amarillas",
  perdon: "Pedir perdón",
  propuesta: "Propuesta",
  graduacion: "Graduación",
  empresarial: "Empresarial",
};

/** /pedir/:handle — el cliente final elige su regalo y deja sus datos. */
export default function StorePage() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading" });
  const [chosen, setChosen] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    publicRequest(`/public/store/${encodeURIComponent(handle)}`)
      .then((data) => setState({ status: "ready", data }))
      .catch((err) => setState({ status: "error", error: err }));
  }, [handle]);

  if (state.status === "loading") {
    return (
      <div className="pt st">
        <div className="pt__inner st__inner">
          <p className="st__muted">Cargando…</p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="pt st">
        <div className="pt__inner st__inner st__center">
          <h1 className="st__title">Esta página no está disponible</h1>
          <p className="st__muted">{state.error?.message || "Puede que el link haya cambiado."}</p>
        </div>
      </div>
    );
  }

  const { seller, items } = state.data;

  const start = async (event) => {
    event.preventDefault();
    setError(null);
    setSending(true);
    try {
      const { token } = await publicRequest(`/public/store/${encodeURIComponent(handle)}/orders`, {
        method: "POST",
        body: { templateId: chosen.templateId, name: form.name.trim(), phone: form.phone.trim() },
      });
      navigate(`/upload/${token}`);
    } catch (err) {
      setError(err.message || "No pudimos empezar tu pedido.");
      setSending(false);
    }
  };

  return (
    <div className="pt st">
      <div className="pt__inner st__inner">
        <header className="st__head">
          <p className="st__eyebrow">Regalos digitales</p>
          <h1 className="st__title">{seller.name}</h1>
          <p className="st__muted">
            {seller.message || "Elige tu regalo, llena los datos y recíbelo como link y código QR para enviarlo."}
          </p>
        </header>

        {items.length === 0 ? (
          <p className="st__muted st__center">Por ahora no hay regalos disponibles. Escríbele a {seller.name}.</p>
        ) : (
          <ul className="st__grid">
            {items.map((item) => {
              const template = getTemplate(item.templateId);
              return (
                <li key={item.templateId} className="st__card">
                  <div className="st__media">
                    {template?.thumbnail ? (
                      <img src={template.thumbnail} alt="" loading="lazy" />
                    ) : (
                      <span className="st__media-empty" aria-hidden="true">🎁</span>
                    )}
                    <span className="st__price">S/{item.price.toFixed(2)}</span>
                  </div>
                  <div className="st__body">
                    <h2 className="st__name">{item.name}</h2>
                    <p className="st__muted">{item.description}</p>
                    <div className="st__tags">
                      {item.occasions.slice(0, 3).map((o) => (
                        <span key={o} className="st__tag">
                          {OCCASIONS[o] || o}
                        </span>
                      ))}
                    </div>
                    <div className="st__actions">
                      <a className="pt-btn" href={`/demo/${item.templateId}`} target="_blank" rel="noreferrer">
                        Ver ejemplo
                      </a>
                      <button type="button" className="pt-btn pt-btn--primary" onClick={() => setChosen(item)}>
                        Lo quiero
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="st__foot">Tus datos solo se usan para preparar tu regalo.</p>
      </div>

      {chosen && (
        <div className="st__sheet" role="dialog" aria-label={`Pedir ${chosen.name}`}>
          <form className="st__sheet-inner" onSubmit={start}>
            <h2 className="st__name">{chosen.name}</h2>
            <p className="st__muted">
              S/{chosen.price.toFixed(2)} · Déjanos tus datos y en el siguiente paso armas tu regalo con tus fotos y tu mensaje.
            </p>
            <label className="st__field">
              <span>Tu nombre</span>
              <input
                className="st__input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Rosa Paz"
                maxLength={120}
                required
              />
            </label>
            <label className="st__field">
              <span>Tu WhatsApp</span>
              <input
                className="st__input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="999 888 777"
                inputMode="tel"
                maxLength={40}
                required
              />
              <small className="st__muted">Ahí te enviaremos tu regalo listo.</small>
            </label>
            {error && <p className="pt-error">{error}</p>}
            <div className="pt-actions">
              <button type="button" className="pt-btn" onClick={() => setChosen(null)} disabled={sending}>
                Cancelar
              </button>
              <button type="submit" className="pt-btn pt-btn--primary" disabled={sending}>
                {sending ? "Un momento…" : "Empezar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
