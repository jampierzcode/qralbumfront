// Confirmación de asistencia compartida por todas las invitaciones de boda.
// Guarda la respuesta del invitado en su propio dispositivo para que, al volver a
// abrir la invitación, vea lo que ya contestó (y pueda cambiarlo).
import { useEffect, useState } from "react";
import Icon from "./Icons.jsx";
import { formatLongDate, whatsappLink } from "./format.js";

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento */
  }
};

export default function RsvpForm({
  respond,
  storageKey,
  guestName = "",
  passes = 2,
  deadline = "",
  phone = "",
  coupleNames = "",
  onConfirmed,
  className = "",
  copy = {},
}) {
  const t = {
    intro: "Confírmanos tu asistencia.",
    name: "Tu nombre",
    namePlaceholder: "Nombre y apellido",
    people: "¿Cuántos asisten?",
    message: "Mensaje para los novios (opcional)",
    yes: "Sí, ahí estaré",
    no: "No podré ir",
    sending: "Enviando…",
    whatsapp: "Confirmar por WhatsApp",
    change: "Cambiar mi respuesta",
    ...copy,
  };

  const max = Math.max(1, Math.min(20, Number(passes) || 1));
  const [name, setName] = useState(guestName);
  const [guests, setGuests] = useState(max);
  const [message, setMessage] = useState("");
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    const saved = read(storageKey);
    if (saved) setState({ status: "done", ...saved });
  }, [storageKey]);

  const send = async (answer) => {
    const clean = name.trim();
    if (!clean) {
      setState({ status: "error", error: "Escribe tu nombre para confirmar." });
      return;
    }
    setState({ status: "sending", answer });
    try {
      const payload = { name: clean, answer, guests: answer === "no" ? 0 : guests, message: message.trim() };
      await respond("rsvp", payload);
      write(storageKey, payload);
      setState({ status: "done", ...payload });
      if (answer === "yes") onConfirmed?.();
    } catch (error) {
      setState({ status: "error", error: error?.message || "No pudimos enviar tu respuesta. Intenta de nuevo." });
    }
  };

  if (state.status === "done") {
    const done =
      state.answer === "yes"
        ? `¡Gracias, ${state.name}! Te esperamos${state.guests > 1 ? ` con ${state.guests} lugares apartados` : ""}.`
        : `Gracias por avisarnos, ${state.name}. Te vamos a extrañar.`;
    return (
      <div className={`wk-rsvp wk-rsvp--done ${className}`} role="status">
        <Icon name={state.answer === "yes" ? "check" : "heart"} className="wk-rsvp__done-icon" />
        <p className="wk-rsvp__done">{done}</p>
        <button type="button" className="wk-link" onClick={() => setState({ status: "idle" })}>
          {t.change}
        </button>
      </div>
    );
  }

  const busy = state.status === "sending";
  const wa = whatsappLink(phone, coupleNames ? `¡Hola! Confirmo mi asistencia a la boda de ${coupleNames}.` : "");

  return (
    <form
      className={`wk-rsvp ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        send("yes");
      }}
    >
      {t.intro && <p className="wk-rsvp__intro">{t.intro}</p>}
      <label className="wk-field">
        <span>{t.name}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} maxLength={80} autoComplete="name" />
      </label>
      {max > 1 && (
        <div className="wk-field">
          <span>{t.people}</span>
          <div className="wk-stepper">
            <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Menos personas">
              −
            </button>
            <output aria-live="polite">{guests}</output>
            <button type="button" onClick={() => setGuests((g) => Math.min(max, g + 1))} aria-label="Más personas">
              +
            </button>
          </div>
          <small className="wk-field__hint">Tu invitación incluye {max} {max === 1 ? "acceso" : "accesos"}.</small>
        </div>
      )}
      <label className="wk-field">
        <span>{t.message}</span>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} maxLength={280} placeholder="Nos vemos ahí ❤" />
      </label>
      {state.status === "error" && (
        <p className="wk-rsvp__error" role="alert">
          {state.error}
        </p>
      )}
      <div className="wk-rsvp__actions">
        <button type="submit" className="wk-btn wk-btn--primary" disabled={busy}>
          {busy && state.answer === "yes" ? t.sending : t.yes}
        </button>
        <button type="button" className="wk-btn wk-btn--ghost" disabled={busy} onClick={() => send("no")}>
          {busy && state.answer === "no" ? t.sending : t.no}
        </button>
      </div>
      {wa && (
        <a className="wk-link wk-link--wa" href={wa} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" />
          {t.whatsapp}
        </a>
      )}
      {deadline && <p className="wk-rsvp__deadline">Confirma antes del {formatLongDate(deadline)}</p>}
    </form>
  );
}
