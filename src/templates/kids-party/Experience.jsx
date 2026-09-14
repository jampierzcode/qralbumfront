import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource/bangers/400.css";
import "@fontsource-variable/nunito/index.css";
import ConfettiBurst from "../../experience-kit/ConfettiBurst.jsx";
import Countdown, { useCountdown } from "../../experience-kit/Countdown.jsx";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import Scenery from "./Scenery.jsx";
import "./styles.css";

const COPY = {
  heroes: { greeting: "¡Hola Héroe!", details: "Detalles de la misión", map: "Mapa del tesoro", count: "La cuenta regresiva", cheer: "¡Será épico!", rsvp: "¿Vienes?", yes: "¡Sí, allí estaré!", album: "Álbum de aventuras", tagline: "Acompáñame en esta gran aventura" },
  princess: { greeting: "¡Hola, Princesa!", details: "Detalles del reino", map: "Camino al castillo", count: "Faltan muy poquito", cheer: "¡Será mágico!", rsvp: "¿Vendrás?", yes: "¡Sí, iré al castillo!", album: "Mis momentos mágicos", tagline: "Acompáñame en un día mágico" },
  dinos: { greeting: "¡Hola, Explorador!", details: "Detalles de la expedición", map: "Mapa de la expedición", count: "La cuenta regresiva", cheer: "¡Será rugiente!", rsvp: "¿Te unes?", yes: "¡Sí, me uno!", album: "Mi expedición", tagline: "Acompáñame en una aventura jurásica" },
  space: { greeting: "¡Hola, Astronauta!", details: "Detalles de la misión", map: "Coordenadas de aterrizaje", count: "Cuenta regresiva al despegue", cheer: "¡Será estelar!", rsvp: "¿Despegas conmigo?", yes: "¡Sí, despego!", album: "Bitácora espacial", tagline: "Acompáñame en una misión espacial" },
};

const CONFETTI = {
  heroes: ["#ffd23f", "#e63946", "#1d4ed8", "#ffffff"],
  princess: ["#ff8fcf", "#ffd86b", "#b388ff", "#ffffff"],
  dinos: ["#ffb13b", "#3ac06b", "#ff6b3d", "#fff3b0"],
  space: ["#7dd3fc", "#ffb86b", "#c4b5fd", "#ffffff"],
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  const text = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  return text.charAt(0).toUpperCase() + text.slice(1).replace(",", "");
}

function formatTime(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return hhmm || "";
  const h = Number(m[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${m[2]} ${suffix}`;
}

function Icon({ name }) {
  const paths = {
    calendar: "M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 7H5v10h14V9Z",
    clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 1-1.7-4-2.3V7Z",
    pin: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z",
  };
  return (
    <svg className={`kp-icon kp-icon--${name}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function Rsvp({ copy, respond, deadline, storageKey, onConfirmed }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved) setState({ status: "done", ...saved });
    } catch {
      /* sin almacenamiento */
    }
  }, [storageKey]);

  const send = async (answer) => {
    if (!name.trim()) {
      setState({ status: "error", error: "Escribe tu nombre para confirmar." });
      return;
    }
    setState({ status: "sending", answer });
    try {
      await respond("rsvp", { name: name.trim(), answer, guests: answer === "no" ? 0 : guests });
      const saved = { name: name.trim(), answer, guests };
      try {
        localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch {
        /* sin almacenamiento */
      }
      setState({ status: "done", ...saved });
      if (answer !== "no") onConfirmed();
    } catch (error) {
      setState({ status: "error", error: error.message || "No pudimos enviar tu respuesta. Intenta de nuevo." });
    }
  };

  if (state.status === "done") {
    const messages = {
      yes: `¡Gracias, ${state.name}! Te esperamos 🎉`,
      maybe: `¡Gracias, ${state.name}! Ojalá puedas venir.`,
      no: `¡Gracias por avisar, ${state.name}! Te extrañaremos.`,
    };
    return (
      <div className="kp-card kp-rsvp kp-rsvp--done" role="status">
        <p className="kp-rsvp__done">{messages[state.answer]}</p>
        <button type="button" className="kp-link" onClick={() => setState({ status: "idle" })}>
          Cambiar mi respuesta
        </button>
      </div>
    );
  }

  const busy = state.status === "sending";
  return (
    <form className="kp-card kp-rsvp" onSubmit={(e) => (e.preventDefault(), send("yes"))}>
      <p className="kp-rsvp__intro">Confirma tu asistencia y ayúdame a preparar esta misión.</p>
      <label className="kp-field">
        <span>Tu nombre</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" maxLength={80} autoComplete="name" />
      </label>
      <div className="kp-field">
        <span>¿Cuántos vienen?</span>
        <div className="kp-stepper">
          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Menos personas">
            −
          </button>
          <output aria-live="polite">{guests}</output>
          <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Más personas">
            +
          </button>
        </div>
      </div>
      {state.status === "error" && (
        <p className="kp-rsvp__error" role="alert">
          {state.error}
        </p>
      )}
      <div className="kp-rsvp__actions">
        <button type="submit" className="kp-btn kp-btn--yes" disabled={busy}>
          ✓ {busy && state.answer === "yes" ? "Enviando…" : copy.yes}
        </button>
        <button type="button" className="kp-btn kp-btn--maybe" disabled={busy} onClick={() => send("maybe")}>
          Tal vez
        </button>
        <button type="button" className="kp-btn kp-btn--no" disabled={busy} onClick={() => send("no")}>
          No podré ir
        </button>
      </div>
      {deadline && <p className="kp-rsvp__deadline">Confirma antes del {deadline}</p>}
    </form>
  );
}

/**
 * Súper cumpleaños (invitación). La portada con el botón de play es la pantalla de apertura.
 * Los invitados confirman asistencia con respond("rsvp", …).
 */
export default function KidsPartyExperience({ content, mode, onEvent, respond, env, opened, open }) {
  const {
    recipientName, age, senderName, coverPhoto, theme = "heroes", greeting, inviteMessage, missionText,
    eventDate, eventTime, venueName, address, reference, mapsUrl, rsvpEnabled, rsvpDeadline, hostPhone,
    photos = [], finalMessage,
  } = content;
  const copy = COPY[theme] || COPY.heroes;
  const calm = env.reducedMotion || mode === "thumbnail";
  const isOpen = opened && mode !== "thumbnail";
  const [burst, setBurst] = useState(0);
  const [viewer, setViewer] = useState(null);
  const eventAt = eventDate && /^\d{1,2}:\d{2}$/.test(eventTime || "") ? new Date(`${eventDate}T${eventTime.padStart(5, "0")}:00`) : eventDate ? new Date(`${eventDate}T00:00:00`) : null;
  const left = useCountdown(eventAt);
  const mapLink = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName || ""} ${address || ""}`.trim())}`;
  const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(address || venueName || "")}&navigate=yes`;
  const storageKey = useMemo(() => `kp-rsvp:${recipientName}:${eventDate}`, [recipientName, eventDate]);
  const finalRef = useRef(null);
  const finalVisible = useInView(finalRef, { threshold: 0.5 });

  useEffect(() => {
    if (finalVisible) onEvent?.("completed");
  }, [finalVisible, onEvent]);

  const start = () => {
    if (isOpen || mode === "thumbnail") return;
    open();
    if (!calm) setBurst((b) => b + 1);
  };

  const title = (
    <h1 className="kp-title">
      <span>¡{recipientName}</span>
      <span>cumple {age}!</span>
    </h1>
  );

  return (
    <div className="kp" data-theme={theme} data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      <div className="kp-bg">
        <Scenery theme={theme} />
      </div>

      {/* 1. Portada */}
      <section className="kp-panel kp-cover" aria-label="Portada">
        <div className="kp-cover__photo">
          <div className="kp-burst" aria-hidden="true" />
          <Photo image={coverPhoto} sizes="(min-width: 1024px) 34vw, 70vw" loading="eager" className="kp-cover__img" />
        </div>
        <div className="kp-cover__text">
          {title}
          <p className="kp-ribbon">{copy.tagline}</p>
          {!isOpen ? (
            <button type="button" className="kp-play" data-gift-open onClick={start} disabled={mode === "thumbnail"} aria-label="Abrir la invitación">
              <span>▶</span>
            </button>
          ) : null}
          <p className="kp-hint">{isOpen ? "Desliza para ver la invitación" : "Toca para comenzar"}</p>
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2. Mensaje */}
          <section className="kp-panel kp-hello" aria-label="Invitación">
            <Reveal as="h2" variant="scale" className="kp-heading">
              {greeting || copy.greeting}
            </Reveal>
            <Reveal className="kp-bubble" delay={150}>
              {inviteMessage}
            </Reveal>
            <Reveal className="kp-polaroid" delay={250}>
              <Photo image={photos[0] || coverPhoto} sizes="(min-width: 1024px) 26vw, 64vw" />
            </Reveal>
            <Reveal className="kp-bubble kp-bubble--alt" delay={350}>
              {missionText}
            </Reveal>
          </section>

          {/* 3. Detalles */}
          <section className="kp-panel kp-details" aria-label="Detalles del evento">
            <Reveal as="h2" variant="scale" className="kp-heading">
              {copy.details}
            </Reveal>
            <Reveal className="kp-card kp-info" delay={150}>
              <div className="kp-info__row">
                <Icon name="calendar" />
                <strong>{formatDate(eventDate)}</strong>
              </div>
              <div className="kp-info__row">
                <Icon name="clock" />
                <strong>{formatTime(eventTime)}</strong>
              </div>
              <div className="kp-info__row">
                <Icon name="pin" />
                <div>
                  <strong>{venueName}</strong>
                  <span>{address}</span>
                  {reference && <span>{reference}</span>}
                </div>
              </div>
              <p className="kp-info__cheer">¡No faltes!</p>
            </Reveal>
          </section>

          {/* 4. Mapa */}
          {address && (
            <section className="kp-panel kp-map" aria-label="Ubicación">
              <Reveal as="h2" variant="scale" className="kp-heading">
                {copy.map}
              </Reveal>
              <Reveal className="kp-card kp-mapcard" delay={150}>
                <div className="kp-mapcard__art" aria-hidden="true">
                  <span className="kp-mapcard__pin">
                    <Icon name="pin" />
                  </span>
                </div>
                <p className="kp-mapcard__address">
                  <strong>{venueName}</strong>
                  {address}
                </p>
                <div className="kp-mapcard__actions">
                  <a className="kp-btn kp-btn--primary" href={mapLink} target="_blank" rel="noreferrer">
                    Abrir en Google Maps
                  </a>
                  <a className="kp-btn kp-btn--ghost" href={wazeLink} target="_blank" rel="noreferrer">
                    Waze
                  </a>
                </div>
              </Reveal>
            </section>
          )}

          {/* 5. Cuenta regresiva */}
          {eventAt && (
            <section className="kp-panel kp-count" aria-label="Cuenta regresiva">
              <Reveal as="h2" variant="scale" className="kp-heading">
                {left?.done ? "¡Hoy es el gran día!" : copy.count}
              </Reveal>
              {!left?.done && <Countdown target={eventAt} className="kp-countdown" />}
              <Reveal className="kp-sticker" delay={300}>
                {copy.cheer}
              </Reveal>
            </section>
          )}

          {/* 6. Confirmación */}
          {rsvpEnabled !== false && (
            <section className="kp-panel kp-confirm" aria-label="Confirmar asistencia">
              <Reveal as="h2" variant="scale" className="kp-heading">
                {copy.rsvp}
              </Reveal>
              <Reveal delay={150} className="kp-confirm__body">
                <Rsvp
                  copy={copy}
                  respond={respond}
                  deadline={rsvpDeadline ? formatDate(rsvpDeadline) : ""}
                  storageKey={storageKey}
                  onConfirmed={() => !calm && setBurst((b) => b + 1)}
                />
              </Reveal>
              {hostPhone && (
                <a className="kp-link kp-whatsapp" href={`https://wa.me/${hostPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  ¿Dudas? Escríbenos por WhatsApp
                </a>
              )}
            </section>
          )}

          {/* 7. Álbum */}
          {photos.length > 1 && (
            <section className="kp-panel kp-album" aria-label="Álbum">
              <Reveal as="h2" variant="scale" className="kp-heading">
                {copy.album}
              </Reveal>
              <ul className="kp-album__grid">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 80} style={{ "--tilt": `${[-4, 3, -2, 5][i % 4]}deg` }}>
                    <button type="button" className="kp-polaroid kp-polaroid--small" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 1024px) 22vw, 44vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 8. Final */}
          <section className="kp-panel kp-final" ref={finalRef} aria-label="Gracias">
            {!calm && <Particles className="kp-hearts" kind="hearts" color="#ff5c8a" density={0.9} max={24} />}
            <Reveal as="h2" variant="scale" className="kp-heading kp-heading--xl">
              ¡Gracias!
            </Reveal>
            <Reveal className="kp-final__photo" delay={150}>
              <Photo image={coverPhoto} sizes="(min-width: 1024px) 24vw, 52vw" />
            </Reveal>
            <Reveal className="kp-card kp-final__card" delay={250}>
              <p>{finalMessage}</p>
              {senderName && <span>{senderName}</span>}
            </Reveal>
          </section>
        </>
      )}

      <ConfettiBurst trigger={burst} colors={CONFETTI[theme]} />
      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
