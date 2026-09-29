import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/nunito/index.css";
import "@fontsource/caveat/400.css";
import ConfettiBurst from "../../experience-kit/ConfettiBurst.jsx";
import Countdown, { useCountdown } from "../../experience-kit/Countdown.jsx";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import { DragonBall } from "./Dragon.jsx";
import Icon from "./Icons.jsx";
import { babyIllustration } from "../baby-shower/media/index.js";
import dragonSrc from "./media/dragon.webp";
import Scenery from "./Scenery.jsx";
import "./styles.css";

const COPY = {
  boy: {
    tag: "¡Es un pequeño Sayayin!",
    greeting: "Un pequeño Sayayin viene en camino",
    crown: "¡Su nivel de ternura es mayor a 9000!",
    wish: "¡Tu deseo se cumplió!",
    details: "Detalles del gran día",
    map: "Cómo llegar",
    count: "Falta poquito para conocerlo",
    today: "¡Hoy celebramos su llegada!",
    gifts: "Para consentirlo",
    rsvp: "¿Nos acompañas?",
    yes: "¡Sí, allí estaré!",
    album: "La dulce espera",
    cheer: "¡Bienvenido, pequeño guerrero!",
    thanks: "¡Gracias!",
  },
  girl: {
    tag: "¡Es una pequeña Sayayin!",
    greeting: "Una pequeña Sayayin viene en camino",
    crown: "¡Su nivel de ternura es mayor a 9000!",
    wish: "¡Tu deseo se cumplió!",
    details: "Detalles del gran día",
    map: "Cómo llegar",
    count: "Falta poquito para conocerla",
    today: "¡Hoy celebramos su llegada!",
    gifts: "Para consentirla",
    rsvp: "¿Nos acompañas?",
    yes: "¡Sí, allí estaré!",
    album: "La dulce espera",
    cheer: "¡Bienvenida, pequeña guerrera!",
    thanks: "¡Gracias!",
  },
  surprise: {
    tag: "¡Un nuevo Sayayin!",
    greeting: "Un nuevo Sayayin viene en camino",
    crown: "¡Su nivel de ternura es mayor a 9000!",
    wish: "¡Tu deseo se cumplió!",
    details: "Detalles del gran día",
    map: "Cómo llegar",
    count: "Falta poquito para conocerle",
    today: "¡Hoy celebramos su llegada!",
    gifts: "Para consentirle",
    rsvp: "¿Nos acompañas?",
    yes: "¡Sí, allí estaré!",
    album: "La dulce espera",
    cheer: "¡Bienvenido al mundo!",
    thanks: "¡Gracias!",
  },
};

const CONFETTI = {
  boy: ["#ffab3d", "#ffd36b", "#7fb2ea", "#ffffff"],
  girl: ["#ffab3d", "#ffd36b", "#ff9ec7", "#ffffff"],
  surprise: ["#ffab3d", "#ffd36b", "#c096dd", "#ffffff"],
};

const SPARKLE = { boy: "#fff8d0", girl: "#fff3c4", surprise: "#fff3c4" };

// Adornos que flotan detrás de la invitación (cantidad fija: nada de nodos sin límite).
const FLOATIES = [
  { name: "bottle", top: "10%", left: "5%", size: 54, delay: 0 },
  { name: "rattle", top: "24%", left: "86%", size: 48, delay: 1.4 },
  { name: "bear", top: "46%", left: "4%", size: 62, delay: 2.6 },
  { ball: 6, top: "60%", left: "88%", size: 34, delay: 0.8 },
  { name: "booties", top: "78%", left: "8%", size: 50, delay: 3.2 },
  { name: "onesie", top: "88%", left: "72%", size: 46, delay: 1.1 },
];


// Las 7 esferas de la portada, en círculo alrededor del aro dorado.
const ORBIT = [1, 2, 3, 4, 5, 6, 7];


const IDEA_ICONS = ["gift", "bottle", "onesie", "bear", "booties", "rattle", "pacifier", "stroller"];

// Si la idea menciona algo conocido le ponemos su icono; si no, rota por la lista.
const IDEA_MATCHES = [
  [/biber|tetero|mamader|leche|f[oó]rmula/i, "bottle"],
  [/chup|bobo|pepe/i, "pacifier"],
  [/sonaj|juguet|morded/i, "rattle"],
  [/peluche|osit|muñec/i, "bear"],
  [/coche|carrio|carreo|cuna|corral|silla/i, "stroller"],
  [/zapat|medi|escarpin|patuc|calcet/i, "booties"],
  [/pañal/i, "diaper"],
  [/manta|mantita|cobij|frazad|arrull/i, "blanket"],
  [/toallit|toalla|babero|pañit/i, "wipes"],
  [/body|bodi|ropa|mamelu|pijama|enteriz|gorrit/i, "onesie"],
];

function iconForIdea(text, index) {
  const match = IDEA_MATCHES.find(([re]) => re.test(text));
  return match ? match[1] : IDEA_ICONS[index % IDEA_ICONS.length];
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  const text = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  return text.charAt(0).toUpperCase() + text.slice(1).replace(",", "");
}

function formatMonth(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  // En español el mes va en minúscula: "Llega en noviembre de 2026".
  return new Intl.DateTimeFormat("es", { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

function formatTime(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || "");
  if (!m) return hhmm || "";
  const h = Number(m[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${m[2]} ${suffix}`;
}

function Rsvp({ copy, respond, deadline, storageKey, onConfirmed }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
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
      await respond("rsvp", { name: name.trim(), answer, guests: answer === "no" ? 0 : guests, message: message.trim() });
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
      yes: `¡Gracias, ${state.name}! Te esperamos con mucha ilusión.`,
      maybe: `¡Gracias, ${state.name}! Ojalá puedas acompañarnos.`,
      no: `¡Gracias por avisar, ${state.name}! Te mandamos un abrazo.`,
    };
    return (
      <div className="bsd-card bsd-rsvp bsd-rsvp--done" role="status">
        <Icon name="heart" className="bsd-rsvp__seal" />
        <p className="bsd-rsvp__done">{messages[state.answer]}</p>
        <button type="button" className="bsd-link" onClick={() => setState({ status: "idle" })}>
          Cambiar mi respuesta
        </button>
      </div>
    );
  }

  const busy = state.status === "sending";
  return (
    <form className="bsd-card bsd-rsvp" onSubmit={(e) => (e.preventDefault(), send("yes"))}>
      <p className="bsd-rsvp__intro">Confirma tu asistencia para guardarte un lugarcito.</p>
      <label className="bsd-field">
        <span>Tu nombre</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" maxLength={80} autoComplete="name" />
      </label>
      <div className="bsd-field">
        <span>¿Cuántos vienen?</span>
        <div className="bsd-stepper">
          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Menos personas">
            −
          </button>
          <output aria-live="polite">{guests}</output>
          <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Más personas">
            +
          </button>
        </div>
      </div>
      <label className="bsd-field">
        <span>Un deseo para el bebé (opcional)</span>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Que llegue con mucha salud…" maxLength={140} />
      </label>
      {state.status === "error" && (
        <p className="bsd-rsvp__error" role="alert">
          {state.error}
        </p>
      )}
      <div className="bsd-rsvp__actions">
        <button type="submit" className="bsd-btn bsd-btn--yes" disabled={busy}>
          {busy && state.answer === "yes" ? "Enviando…" : copy.yes}
        </button>
        <button type="button" className="bsd-btn bsd-btn--soft" disabled={busy} onClick={() => send("maybe")}>
          Tal vez
        </button>
        <button type="button" className="bsd-btn bsd-btn--ghost" disabled={busy} onClick={() => send("no")}>
          No podré ir
        </button>
      </div>
      {deadline && <p className="bsd-rsvp__deadline">Confirma antes del {deadline}</p>}
    </form>
  );
}

/**
 * Baby shower de las esferas del dragón. Cielo azul si es niño, atardecer rosado si es niña, morado si aún es sorpresa.
 * La portada (7 esferas + dragón) es la pantalla de apertura; los invitados confirman con respond("rsvp", …).
 */
export default function BabyShowerDragonExperience({ content, mode, onEvent, respond, env, opened, open }) {
  const {
    recipientName, senderName, gender = "girl", dueDate, coverPhoto, greeting, announceMessage, inviteMessage,
    eventDate, eventTime, venueName, address, reference, mapsUrl, dressCode,
    giftIdeas = [], registryUrl, registryNote, rsvpEnabled, rsvpDeadline, hostPhone,
    photos = [], finalMessage,
  } = content;
  const copy = COPY[gender] || COPY.girl;
  // Sin foto propia, la portada usa la ilustración del bebé que toca (azul o rosada).
  const cover = coverPhoto?.src ? coverPhoto : babyIllustration(gender);
  const calm = env.reducedMotion || mode === "thumbnail" || env.tier === "low";
  const isOpen = opened && mode !== "thumbnail";
  const [burst, setBurst] = useState(0);
  const [viewer, setViewer] = useState(null);
  const eventAt = eventDate && /^\d{1,2}:\d{2}$/.test(eventTime || "")
    ? new Date(`${eventDate}T${eventTime.padStart(5, "0")}:00`)
    : eventDate
      ? new Date(`${eventDate}T00:00:00`)
      : null;
  const left = useCountdown(eventAt);
  const mapLink = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName || ""} ${address || ""}`.trim())}`;
  const wazeLink = `https://waze.com/ul?q=${encodeURIComponent(address || venueName || "")}&navigate=yes`;
  const storageKey = useMemo(() => `bsd-rsvp:${recipientName}:${eventDate}`, [recipientName, eventDate]);
  const ideas = (giftIdeas || []).filter((idea) => String(idea || "").trim());
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

  return (
    <div className="bsd" data-gender={gender} data-open={isOpen ? "true" : undefined} data-lit={isOpen || mode === "thumbnail" ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      <div className="bsd-bg">
        <Scenery gender={gender} />
        {!calm && (
          <div className="bsd-floaties" aria-hidden="true">
            {FLOATIES.map((floaty) => (
              <span
                key={floaty.ball || floaty.name}
                className={`bsd-floaty${floaty.ball ? " bsd-floaty--ball" : ""}`}
                style={{ top: floaty.top, left: floaty.left, "--size": `${floaty.size}px`, "--delay": `${floaty.delay}s` }}
              >
                {floaty.ball ? <DragonBall stars={floaty.ball} /> : <Icon name={floaty.name} />}
              </span>
            ))}
          </div>
        )}
        {!calm && <Particles className="bsd-sparkles" kind="sparkles" color={SPARKLE[gender] || "#fff"} density={0.7} max={60} />}
      </div>

      {/* 1. Portada: las 7 esferas se encienden una a una y el dragón sube detrás del aro */}
      <section className="bsd-panel bsd-cover" aria-label="Portada">
        <img className="bsd-cover__dragon" src={dragonSrc} width="720" height="1279" alt="" aria-hidden="true" decoding="async" />
        <div className="bsd-stage">
          <div className="bsd-orbit" aria-hidden="true">
            {ORBIT.map((n, i) => (
              <span key={n} className="bsd-orbit__slot" style={{ "--a": `${(360 / ORBIT.length) * i}deg`, "--i": i }}>
                <DragonBall stars={n} className="bsd-orbit__ball" />
              </span>
            ))}
          </div>
          <div className="bsd-medallion">
            <div className="bsd-medallion__ring">
              <Photo image={cover} sizes="(min-width: 1024px) 32vw, 72vw" loading="eager" className="bsd-medallion__img" />
            </div>
          </div>
        </div>
        <div className="bsd-cover__text">
          <p className="bsd-eyebrow">{isOpen ? copy.wish : "Baby shower"}</p>
          <h1 className="bsd-name">{recipientName}</h1>
          <p className="bsd-tag">
            <Icon name={gender === "surprise" ? "star" : "booties"} />
            {copy.tag}
          </p>
          {!isOpen ? (
            <button type="button" className="bsd-open" data-gift-open onClick={start} disabled={mode === "thumbnail"}>
              <DragonBall stars={4} className="bsd-open__ball" />
              Invocar al dragón
            </button>
          ) : null}
          <p className="bsd-hint">{isOpen ? "Desliza para ver la invitación" : "Toca para reunir las 7 esferas"}</p>
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2. Anuncio */}
          <section className="bsd-panel bsd-hello" aria-label="Anuncio">
            <Reveal as="h2" variant="scale" className="bsd-heading">
              {greeting || copy.greeting}
            </Reveal>
            <Reveal className="bsd-cloud" delay={150}>
              {announceMessage}
            </Reveal>
            <Reveal className="bsd-frame" delay={250}>
              <Photo image={photos[0] || cover} sizes="(min-width: 1024px) 26vw, 64vw" />
              <span className="bsd-frame__tape" aria-hidden="true" />
            </Reveal>
            <Reveal className="bsd-cloud bsd-cloud--alt" delay={350}>
              {inviteMessage}
            </Reveal>
            {dueDate && (
              <Reveal className="bsd-due" delay={420}>
                <Icon name="moon" />
                Llega en {formatMonth(dueDate)}
              </Reveal>
            )}
          </section>

          {/* 3. Detalles */}
          <section className="bsd-panel bsd-details" aria-label="Detalles del evento">
            <Reveal as="h2" variant="scale" className="bsd-heading">
              {copy.details}
            </Reveal>
            <Reveal className="bsd-card bsd-info" delay={150}>
              <div className="bsd-info__row">
                <Icon name="calendar" />
                <strong>{formatDate(eventDate)}</strong>
              </div>
              <div className="bsd-info__row">
                <Icon name="clock" />
                <strong>{formatTime(eventTime)}</strong>
              </div>
              <div className="bsd-info__row">
                <Icon name="pin" />
                <div>
                  <strong>{venueName}</strong>
                  <span>{address}</span>
                  {reference && <span>{reference}</span>}
                </div>
              </div>
              {dressCode && (
                <div className="bsd-info__row">
                  <Icon name="onesie" />
                  <div>
                    <strong>{dressCode}</strong>
                    <span>Código de vestimenta</span>
                  </div>
                </div>
              )}
              <p className="bsd-info__cheer">{copy.cheer}</p>
            </Reveal>
          </section>

          {/* 4. Mapa */}
          {address && (
            <section className="bsd-panel bsd-map" aria-label="Ubicación">
              <Reveal as="h2" variant="scale" className="bsd-heading">
                {copy.map}
              </Reveal>
              <Reveal className="bsd-card bsd-mapcard" delay={150}>
                <div className="bsd-mapcard__art" aria-hidden="true">
                  <span className="bsd-mapcard__pin">
                    <Icon name="pin" />
                  </span>
                </div>
                <p className="bsd-mapcard__address">
                  <strong>{venueName}</strong>
                  {address}
                </p>
                <div className="bsd-mapcard__actions">
                  <a className="bsd-btn bsd-btn--primary" href={mapLink} target="_blank" rel="noreferrer">
                    Abrir en Google Maps
                  </a>
                  <a className="bsd-btn bsd-btn--ghost" href={wazeLink} target="_blank" rel="noreferrer">
                    Waze
                  </a>
                </div>
              </Reveal>
            </section>
          )}

          {/* 5. Cuenta regresiva */}
          {eventAt && (
            <section className="bsd-panel bsd-count" aria-label="Cuenta regresiva">
              <Reveal as="h2" variant="scale" className="bsd-heading">
                {left?.done ? copy.today : copy.count}
              </Reveal>
              {!left?.done && <Countdown target={eventAt} className="bsd-countdown" />}
              <Reveal className="bsd-sticker" delay={300}>
                <DragonBall stars={4} className="bsd-sticker__ball" />
                {copy.crown}
              </Reveal>
            </section>
          )}

          {/* 6. Regalos */}
          {(ideas.length > 0 || registryUrl) && (
            <section className="bsd-panel bsd-gifts" aria-label="Mesa de regalos">
              <Reveal as="h2" variant="scale" className="bsd-heading">
                {copy.gifts}
              </Reveal>
              <Reveal className="bsd-card bsd-giftcard" delay={150}>
                {registryNote && <p className="bsd-giftcard__note">{registryNote}</p>}
                {ideas.length > 0 && (
                  <ul className="bsd-ideas">
                    {ideas.map((idea, i) => (
                      <li key={`${idea}-${i}`}>
                        <Icon name={iconForIdea(idea, i)} />
                        {idea}
                      </li>
                    ))}
                  </ul>
                )}
                {registryUrl && (
                  <a className="bsd-btn bsd-btn--primary" href={registryUrl} target="_blank" rel="noreferrer">
                    Ver la mesa de regalos
                  </a>
                )}
              </Reveal>
            </section>
          )}

          {/* 7. Confirmación */}
          {rsvpEnabled !== false && (
            <section className="bsd-panel bsd-confirm" aria-label="Confirmar asistencia">
              <Reveal as="h2" variant="scale" className="bsd-heading">
                {copy.rsvp}
              </Reveal>
              <Reveal delay={150} className="bsd-confirm__body">
                <Rsvp
                  copy={copy}
                  respond={respond}
                  deadline={rsvpDeadline ? formatDate(rsvpDeadline) : ""}
                  storageKey={storageKey}
                  onConfirmed={() => !calm && setBurst((b) => b + 1)}
                />
              </Reveal>
              {hostPhone && (
                <a className="bsd-link bsd-whatsapp" href={`https://wa.me/${hostPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  ¿Dudas? Escríbenos por WhatsApp
                </a>
              )}
            </section>
          )}

          {/* 8. Álbum */}
          {photos.length > 1 && (
            <section className="bsd-panel bsd-album" aria-label="Álbum">
              <Reveal as="h2" variant="scale" className="bsd-heading">
                {copy.album}
              </Reveal>
              <ul className="bsd-album__grid">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 80} style={{ "--tilt": `${[-3, 2, -2, 3][i % 4]}deg` }}>
                    <button type="button" className="bsd-frame bsd-frame--small" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 1024px) 22vw, 44vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 9. Final */}
          <section className="bsd-panel bsd-final" ref={finalRef} aria-label="Gracias">
            {!calm && <Particles className="bsd-hearts" kind="hearts" color={gender === "boy" ? "#7fb2ea" : "#ffab3d"} density={0.9} max={22} />}
            <Reveal as="h2" variant="scale" className="bsd-heading bsd-heading--xl">
              {copy.thanks}
            </Reveal>
            <Reveal className="bsd-medallion bsd-medallion--small" delay={150}>
              <div className="bsd-medallion__ring">
                <Photo image={cover} sizes="(min-width: 1024px) 24vw, 52vw" className="bsd-medallion__img" />
              </div>
            </Reveal>
            <Reveal className="bsd-card bsd-final__card" delay={250}>
              <p>{finalMessage}</p>
              {senderName && <span className="bsd-sign">{senderName}</span>}
            </Reveal>
          </section>
        </>
      )}

      <ConfettiBurst trigger={burst} colors={CONFETTI[gender] || CONFETTI.girl} />
      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
