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
import Icon from "./Icons.jsx";
import { babyIllustration } from "./media/index.js";
import Scenery from "./Scenery.jsx";
import "./styles.css";

const COPY = {
  boy: {
    tag: "¡Es niño!",
    greeting: "Un principito viene en camino",
    crown: "Su corona de rey ya lo espera",
    announce: "El anuncio",
    details: "Detalles del gran día",
    map: "Cómo llegar",
    count: "Falta poquito para conocerlo",
    today: "¡Hoy celebramos su llegada!",
    gifts: "Para consentirlo",
    rsvp: "¿Nos acompañas?",
    yes: "¡Sí, allí estaré!",
    album: "La dulce espera",
    cheer: "¡Bienvenido, principito!",
    thanks: "¡Gracias!",
  },
  girl: {
    tag: "¡Es niña!",
    greeting: "Una princesita viene en camino",
    crown: "Su corona de reina ya la espera",
    announce: "El anuncio",
    details: "Detalles del gran día",
    map: "Cómo llegar",
    count: "Falta poquito para conocerla",
    today: "¡Hoy celebramos su llegada!",
    gifts: "Para consentirla",
    rsvp: "¿Nos acompañas?",
    yes: "¡Sí, allí estaré!",
    album: "La dulce espera",
    cheer: "¡Bienvenida, princesita!",
    thanks: "¡Gracias!",
  },
  surprise: {
    tag: "¿Príncipe o princesa?",
    greeting: "Un bebé viene en camino",
    crown: "Su corona ya lo espera",
    announce: "El anuncio",
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
  boy: ["#7fb2ea", "#cfe4fb", "#ffe3b0", "#ffffff"],
  girl: ["#ff9ec7", "#ffd6e7", "#ffe3b0", "#ffffff"],
  surprise: ["#ff9ec7", "#7fb2ea", "#ffe3b0", "#ffffff"],
};

const SPARKLE = { boy: "#ffffff", girl: "#fff0f7", surprise: "#fff6fb" };

// Adornos que flotan detrás de la invitación (cantidad fija: nada de nodos sin límite).
const FLOATIES = [
  { name: "bottle", top: "12%", left: "6%", size: 58, delay: 0 },
  { name: "rattle", top: "26%", left: "84%", size: 52, delay: 1.4 },
  { name: "bear", top: "48%", left: "9%", size: 66, delay: 2.6 },
  { name: "pacifier", top: "62%", left: "80%", size: 48, delay: 0.8 },
  { name: "booties", top: "78%", left: "14%", size: 54, delay: 3.2 },
  { name: "crown", top: "8%", left: "72%", size: 46, delay: 2 },
  { name: "onesie", top: "88%", left: "70%", size: 50, delay: 1.1 },
  { name: "stroller", top: "36%", left: "46%", size: 44, delay: 3.8 },
];

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
      <div className="bsh-card bsh-rsvp bsh-rsvp--done" role="status">
        <Icon name="heart" className="bsh-rsvp__seal" />
        <p className="bsh-rsvp__done">{messages[state.answer]}</p>
        <button type="button" className="bsh-link" onClick={() => setState({ status: "idle" })}>
          Cambiar mi respuesta
        </button>
      </div>
    );
  }

  const busy = state.status === "sending";
  return (
    <form className="bsh-card bsh-rsvp" onSubmit={(e) => (e.preventDefault(), send("yes"))}>
      <p className="bsh-rsvp__intro">Confirma tu asistencia para guardarte un lugarcito.</p>
      <label className="bsh-field">
        <span>Tu nombre</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" maxLength={80} autoComplete="name" />
      </label>
      <div className="bsh-field">
        <span>¿Cuántos vienen?</span>
        <div className="bsh-stepper">
          <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Menos personas">
            −
          </button>
          <output aria-live="polite">{guests}</output>
          <button type="button" onClick={() => setGuests((g) => Math.min(20, g + 1))} aria-label="Más personas">
            +
          </button>
        </div>
      </div>
      <label className="bsh-field">
        <span>Un deseo para el bebé (opcional)</span>
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Que llegue con mucha salud…" maxLength={140} />
      </label>
      {state.status === "error" && (
        <p className="bsh-rsvp__error" role="alert">
          {state.error}
        </p>
      )}
      <div className="bsh-rsvp__actions">
        <button type="submit" className="bsh-btn bsh-btn--yes" disabled={busy}>
          {busy && state.answer === "yes" ? "Enviando…" : copy.yes}
        </button>
        <button type="button" className="bsh-btn bsh-btn--soft" disabled={busy} onClick={() => send("maybe")}>
          Tal vez
        </button>
        <button type="button" className="bsh-btn bsh-btn--ghost" disabled={busy} onClick={() => send("no")}>
          No podré ir
        </button>
      </div>
      {deadline && <p className="bsh-rsvp__deadline">Confirma antes del {deadline}</p>}
    </form>
  );
}

/**
 * Baby shower (invitación). Azul si es niño, rosado si es niña, los dos si aún es sorpresa.
 * La portada con la corona es la pantalla de apertura; los invitados confirman con respond("rsvp", …).
 */
export default function BabyShowerExperience({ content, mode, onEvent, respond, env, opened, open }) {
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
  const storageKey = useMemo(() => `bsh-rsvp:${recipientName}:${eventDate}`, [recipientName, eventDate]);
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
    <div className="bsh" data-gender={gender} data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      <div className="bsh-bg">
        <Scenery gender={gender} />
        {!calm && (
          <div className="bsh-floaties" aria-hidden="true">
            {FLOATIES.map((floaty) => (
              <span
                key={floaty.name}
                className="bsh-floaty"
                style={{ top: floaty.top, left: floaty.left, "--size": `${floaty.size}px`, "--delay": `${floaty.delay}s` }}
              >
                <Icon name={floaty.name} />
              </span>
            ))}
          </div>
        )}
        {!calm && <Particles className="bsh-sparkles" kind="sparkles" color={SPARKLE[gender] || "#fff"} density={0.7} max={60} />}
      </div>

      {/* 1. Portada */}
      <section className="bsh-panel bsh-cover" aria-label="Portada">
        <div className="bsh-medallion">
          <Icon name="crown" className="bsh-medallion__crown" />
          <div className="bsh-medallion__ring">
            <Photo image={cover} sizes="(min-width: 1024px) 32vw, 72vw" loading="eager" className="bsh-medallion__img" />
          </div>
        </div>
        <div className="bsh-cover__text">
          <p className="bsh-eyebrow">Baby shower</p>
          <h1 className="bsh-name">{recipientName}</h1>
          <p className="bsh-tag">
            <Icon name={gender === "surprise" ? "star" : "booties"} />
            {copy.tag}
          </p>
          {!isOpen ? (
            <button type="button" className="bsh-open" data-gift-open onClick={start} disabled={mode === "thumbnail"}>
              <Icon name="heart" />
              Abrir la invitación
            </button>
          ) : null}
          <p className="bsh-hint">{isOpen ? "Desliza para ver la invitación" : "Toca para comenzar"}</p>
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2. Anuncio */}
          <section className="bsh-panel bsh-hello" aria-label="Anuncio">
            <Reveal as="h2" variant="scale" className="bsh-heading">
              {greeting || copy.greeting}
            </Reveal>
            <Reveal className="bsh-cloud" delay={150}>
              {announceMessage}
            </Reveal>
            <Reveal className="bsh-frame" delay={250}>
              <Photo image={photos[0] || cover} sizes="(min-width: 1024px) 26vw, 64vw" />
              <span className="bsh-frame__tape" aria-hidden="true" />
            </Reveal>
            <Reveal className="bsh-cloud bsh-cloud--alt" delay={350}>
              {inviteMessage}
            </Reveal>
            {dueDate && (
              <Reveal className="bsh-due" delay={420}>
                <Icon name="moon" />
                Llega en {formatMonth(dueDate)}
              </Reveal>
            )}
          </section>

          {/* 3. Detalles */}
          <section className="bsh-panel bsh-details" aria-label="Detalles del evento">
            <Reveal as="h2" variant="scale" className="bsh-heading">
              {copy.details}
            </Reveal>
            <Reveal className="bsh-card bsh-info" delay={150}>
              <div className="bsh-info__row">
                <Icon name="calendar" />
                <strong>{formatDate(eventDate)}</strong>
              </div>
              <div className="bsh-info__row">
                <Icon name="clock" />
                <strong>{formatTime(eventTime)}</strong>
              </div>
              <div className="bsh-info__row">
                <Icon name="pin" />
                <div>
                  <strong>{venueName}</strong>
                  <span>{address}</span>
                  {reference && <span>{reference}</span>}
                </div>
              </div>
              {dressCode && (
                <div className="bsh-info__row">
                  <Icon name="onesie" />
                  <div>
                    <strong>{dressCode}</strong>
                    <span>Código de vestimenta</span>
                  </div>
                </div>
              )}
              <p className="bsh-info__cheer">{copy.cheer}</p>
            </Reveal>
          </section>

          {/* 4. Mapa */}
          {address && (
            <section className="bsh-panel bsh-map" aria-label="Ubicación">
              <Reveal as="h2" variant="scale" className="bsh-heading">
                {copy.map}
              </Reveal>
              <Reveal className="bsh-card bsh-mapcard" delay={150}>
                <div className="bsh-mapcard__art" aria-hidden="true">
                  <span className="bsh-mapcard__pin">
                    <Icon name="pin" />
                  </span>
                </div>
                <p className="bsh-mapcard__address">
                  <strong>{venueName}</strong>
                  {address}
                </p>
                <div className="bsh-mapcard__actions">
                  <a className="bsh-btn bsh-btn--primary" href={mapLink} target="_blank" rel="noreferrer">
                    Abrir en Google Maps
                  </a>
                  <a className="bsh-btn bsh-btn--ghost" href={wazeLink} target="_blank" rel="noreferrer">
                    Waze
                  </a>
                </div>
              </Reveal>
            </section>
          )}

          {/* 5. Cuenta regresiva */}
          {eventAt && (
            <section className="bsh-panel bsh-count" aria-label="Cuenta regresiva">
              <Reveal as="h2" variant="scale" className="bsh-heading">
                {left?.done ? copy.today : copy.count}
              </Reveal>
              {!left?.done && <Countdown target={eventAt} className="bsh-countdown" />}
              <Reveal className="bsh-sticker" delay={300}>
                <Icon name="bear" />
                {copy.crown}
              </Reveal>
            </section>
          )}

          {/* 6. Regalos */}
          {(ideas.length > 0 || registryUrl) && (
            <section className="bsh-panel bsh-gifts" aria-label="Mesa de regalos">
              <Reveal as="h2" variant="scale" className="bsh-heading">
                {copy.gifts}
              </Reveal>
              <Reveal className="bsh-card bsh-giftcard" delay={150}>
                {registryNote && <p className="bsh-giftcard__note">{registryNote}</p>}
                {ideas.length > 0 && (
                  <ul className="bsh-ideas">
                    {ideas.map((idea, i) => (
                      <li key={`${idea}-${i}`}>
                        <Icon name={iconForIdea(idea, i)} />
                        {idea}
                      </li>
                    ))}
                  </ul>
                )}
                {registryUrl && (
                  <a className="bsh-btn bsh-btn--primary" href={registryUrl} target="_blank" rel="noreferrer">
                    Ver la mesa de regalos
                  </a>
                )}
              </Reveal>
            </section>
          )}

          {/* 7. Confirmación */}
          {rsvpEnabled !== false && (
            <section className="bsh-panel bsh-confirm" aria-label="Confirmar asistencia">
              <Reveal as="h2" variant="scale" className="bsh-heading">
                {copy.rsvp}
              </Reveal>
              <Reveal delay={150} className="bsh-confirm__body">
                <Rsvp
                  copy={copy}
                  respond={respond}
                  deadline={rsvpDeadline ? formatDate(rsvpDeadline) : ""}
                  storageKey={storageKey}
                  onConfirmed={() => !calm && setBurst((b) => b + 1)}
                />
              </Reveal>
              {hostPhone && (
                <a className="bsh-link bsh-whatsapp" href={`https://wa.me/${hostPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  ¿Dudas? Escríbenos por WhatsApp
                </a>
              )}
            </section>
          )}

          {/* 8. Álbum */}
          {photos.length > 1 && (
            <section className="bsh-panel bsh-album" aria-label="Álbum">
              <Reveal as="h2" variant="scale" className="bsh-heading">
                {copy.album}
              </Reveal>
              <ul className="bsh-album__grid">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 80} style={{ "--tilt": `${[-3, 2, -2, 3][i % 4]}deg` }}>
                    <button type="button" className="bsh-frame bsh-frame--small" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 1024px) 22vw, 44vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 9. Final */}
          <section className="bsh-panel bsh-final" ref={finalRef} aria-label="Gracias">
            {!calm && <Particles className="bsh-hearts" kind="hearts" color={gender === "boy" ? "#7fb2ea" : "#ff9ec7"} density={0.9} max={22} />}
            <Reveal as="h2" variant="scale" className="bsh-heading bsh-heading--xl">
              {copy.thanks}
            </Reveal>
            <Reveal className="bsh-medallion bsh-medallion--small" delay={150}>
              <Icon name="crown" className="bsh-medallion__crown" />
              <div className="bsh-medallion__ring">
                <Photo image={cover} sizes="(min-width: 1024px) 24vw, 52vw" className="bsh-medallion__img" />
              </div>
            </Reveal>
            <Reveal className="bsh-card bsh-final__card" delay={250}>
              <p>{finalMessage}</p>
              {senderName && <span className="bsh-sign">{senderName}</span>}
            </Reveal>
          </section>
        </>
      )}

      <ConfettiBurst trigger={burst} colors={CONFETTI[gender] || CONFETTI.girl} />
      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
