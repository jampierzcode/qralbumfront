import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource-variable/inter/index.css";
import Countdown, { useCountdown } from "../../experience-kit/Countdown.jsx";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import EventBlock from "../_wedding-kit/EventBlock.jsx";
import Icon from "../_wedding-kit/Icons.jsx";
import RsvpForm from "../_wedding-kit/RsvpForm.jsx";
import Timeline from "../_wedding-kit/Timeline.jsx";
import {
  DRESS_CODE_HINTS,
  DRESS_CODE_LABELS,
  calendarLink,
  dateParts,
  eventDateTime,
  formatLongDate,
  initial,
} from "../_wedding-kit/format.js";
import { Blooms, WaxSeal } from "./Blooms.jsx";
import "../_wedding-kit/wedding-kit.css";
import "./styles.css";

/**
 * Boda azul noche. El sobre con el sello de cera es la pantalla de apertura:
 * al tocarlo se llama a open() (dentro del gesto) y se destapan las tarjetas.
 */
export default function WeddingNavyExperience({ content, mode, onEvent, respond, env, opened, open }) {
  const {
    brideName, groomName, coverPhoto, quote, inviteMessage, sealColor = "gold",
    recipientName, passes, guestNote,
    eventDate, eventTime, venueName, address, reference, mapsUrl,
    receptionTime, receptionVenue, receptionAddress, receptionMapsUrl,
    dressCode, dressCodeNote, itinerary = [], notes, giftsNote, giftsUrl,
    rsvpEnabled, rsvpDeadline, hostPhone, rsvpNote,
    photos = [], finalMessage,
  } = content;

  const calm = env.reducedMotion || mode === "thumbnail" || env.tier === "low";
  const isOpen = opened && mode !== "thumbnail";
  const [viewer, setViewer] = useState(null);
  const names = [brideName, groomName].filter(Boolean).join(" & ");
  const initials = `${initial(brideName)}|${initial(groomName)}`;
  const date = dateParts(eventDate);
  const ceremonyAt = eventDateTime(eventDate, eventTime);
  const left = useCountdown(ceremonyAt);
  const storageKey = useMemo(() => `wedding-navy:${names}:${eventDate}`, [names, eventDate]);
  const finalRef = useRef(null);
  const finalVisible = useInView(finalRef, { threshold: 0.5 });
  const agenda = calendarLink({
    title: `Boda de ${names}`,
    start: ceremonyAt,
    location: `${venueName || ""} ${address || ""}`.trim(),
    details: quote,
  });

  useEffect(() => {
    if (finalVisible) onEvent?.("completed");
  }, [finalVisible, onEvent]);

  return (
    <div className="wn" data-seal={sealColor} data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      <div className="wn-bg" aria-hidden="true">
        <span className="wn-bg__sky" />
        <Blooms className="wn-blooms--tl" variant="a" />
        <Blooms className="wn-blooms--br" variant="b" />
        {!calm && <Particles className="wn-stars" kind="sparkles" color="#f0e2b8" density={0.7} max={40} />}
      </div>

      {/* 1 · El sobre con el sello */}
      {!isOpen && mode !== "thumbnail" ? (
        <section className="wn-panel wn-envelope" aria-label="Abrir la invitación">
          <p className="wn-envelope__eyebrow">Invitación interactiva</p>
          <h1 className="wn-envelope__title">
            <span>Nuestra</span>
            <em>boda</em>
          </h1>
          <div className="wn-envelope__card">
            <span className="wn-envelope__flap" aria-hidden="true" />
            <button type="button" className="wn-envelope__seal" data-gift-open onClick={open} aria-label="Abrir la invitación">
              <WaxSeal initials={initials} />
            </button>
          </div>
          <p className="wn-envelope__hint">Toca el sello</p>
          <p className="wn-envelope__names">{names}</p>
        </section>
      ) : (
        <>
          {/* 2 · Portada */}
          <section className="wn-panel wn-hero" aria-label="Portada">
            <div className="wn-arch wn-hero__photo">
              <Photo image={coverPhoto} sizes="(min-width: 900px) 40vw, 82vw" loading="eager" alt="" />
              <span className="wn-arch__line" aria-hidden="true" />
            </div>
            <p className="wn-eyebrow">Nuestra boda</p>
            <h1 className="wn-names">{names}</h1>
            {date && (
              <p className="wn-hero__date">
                {date.weekday} · {date.day} de {date.month.toLowerCase()} de {date.year}
              </p>
            )}
            {quote && <p className="wn-hero__quote">{quote}</p>}
          </section>

          {/* 3 · Cuenta regresiva */}
          {ceremonyAt && (
            <section className="wn-panel" aria-label="Cuenta regresiva">
              <Reveal className="wn-card wn-count">
                <p className="wn-card__title">{left?.done ? "¡Hoy nos casamos!" : "Faltan"}</p>
                {!left?.done && <Countdown target={ceremonyAt} className="wk-countdown wn-countdown" />}
                {agenda && (
                  <a className="wk-btn wk-btn--ghost" href={agenda} target="_blank" rel="noreferrer">
                    <Icon name="calendar" />
                    Agendar el día
                  </a>
                )}
              </Reveal>
            </section>
          )}

          {/* 4 · La invitación y el invitado */}
          <section className="wn-panel" aria-label="Invitación">
            <Reveal className="wn-card wn-invite">
              <Icon name="rings" className="wn-card__icon" />
              <p className="wn-invite__text">{inviteMessage}</p>
              {recipientName && (
                <div className="wn-guest">
                  <p className="wn-guest__label">Invitado</p>
                  <p className="wn-guest__name">{recipientName}</p>
                  {passes > 0 && (
                    <p className="wn-guest__passes">
                      {passes} {passes === 1 ? "acceso" : "accesos"}
                    </p>
                  )}
                  {guestNote && <p className="wn-guest__note">{guestNote}</p>}
                </div>
              )}
            </Reveal>
          </section>

          {/* 5 · Ceremonia y recepción */}
          <section className="wn-panel" aria-label="Ceremonia y recepción">
            {eventDate && (
              <Reveal as="p" className="wn-eyebrow">
                {formatLongDate(eventDate)}
              </Reveal>
            )}
            <div className="wn-events">
              <Reveal delay={80}>
                <EventBlock
                  eyebrow="Ceremonia"
                  icon="church"
                  time={eventTime}
                  venue={venueName}
                  address={address}
                  reference={reference}
                  mapsUrl={mapsUrl}
                  mapsLabel="Ubicación"
                  className="wn-card wn-event"
                />
              </Reveal>
              {(receptionVenue || receptionAddress) && (
                <Reveal delay={160}>
                  <EventBlock
                    eyebrow="Recepción"
                    icon="glass"
                    time={receptionTime}
                    venue={receptionVenue}
                    address={receptionAddress}
                    mapsUrl={receptionMapsUrl}
                    mapsLabel="Ubicación"
                    className="wn-card wn-event"
                  />
                </Reveal>
              )}
            </div>
          </section>

          {/* 6 · Dress code, itinerario y detalles */}
          {(dressCode || itinerary.length > 0 || notes || giftsNote) && (
            <section className="wn-panel" aria-label="Detalles">
              <div className="wn-details">
                {dressCode && (
                  <Reveal className="wn-card wn-detail" delay={60}>
                    <Icon name="dress" className="wn-card__icon" />
                    <p className="wn-card__title">Dress code</p>
                    <p className="wn-detail__value">{DRESS_CODE_LABELS[dressCode] || dressCode}</p>
                    <p className="wn-card__text">{dressCodeNote || DRESS_CODE_HINTS[dressCode]}</p>
                  </Reveal>
                )}
                {itinerary.length > 0 && (
                  <Reveal className="wn-card wn-detail wn-detail--wide" delay={120}>
                    <Icon name="clock" className="wn-card__icon" />
                    <p className="wn-card__title">Itinerario</p>
                    <Timeline items={itinerary} />
                  </Reveal>
                )}
                {giftsNote && (
                  <Reveal className="wn-card wn-detail" delay={180}>
                    <Icon name="gift" className="wn-card__icon" />
                    <p className="wn-card__title">Mesa de regalos</p>
                    <p className="wn-card__text">{giftsNote}</p>
                    {giftsUrl && (
                      <a className="wk-btn wk-btn--ghost" href={giftsUrl} target="_blank" rel="noreferrer">
                        Ver la lista
                      </a>
                    )}
                  </Reveal>
                )}
                {notes && (
                  <Reveal className="wn-card wn-detail" delay={240}>
                    <Icon name="envelope" className="wn-card__icon" />
                    <p className="wn-card__title">Para tener en cuenta</p>
                    <p className="wn-card__text">{notes}</p>
                  </Reveal>
                )}
              </div>
            </section>
          )}

          {/* 7 · Confirmación */}
          {rsvpEnabled !== false && (
            <section className="wn-panel" aria-label="Confirmar asistencia">
              <Reveal className="wn-card wn-rsvp-card">
                <Icon name="heart" className="wn-card__icon" />
                <p className="wn-card__title">Confirmación de asistencia</p>
                {rsvpNote && <p className="wn-card__text">{rsvpNote}</p>}
                <RsvpForm
                  respond={respond}
                  storageKey={storageKey}
                  guestName={recipientName}
                  passes={passes}
                  deadline={rsvpDeadline}
                  phone={hostPhone}
                  coupleNames={names}
                  className="wn-rsvp"
                  copy={{ intro: "" }}
                />
              </Reveal>
            </section>
          )}

          {/* 8 · Galería */}
          {photos.length > 0 && (
            <section className="wn-panel" aria-label="Galería">
              <Reveal as="p" className="wn-eyebrow">
                Nosotros
              </Reveal>
              <ul className="wn-gallery">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 90}>
                    <button type="button" className="wn-gallery__item wn-arch" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 900px) 26vw, 45vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 9 · Cierre */}
          <section className="wn-panel wn-final" ref={finalRef} aria-label="Gracias">
            <Reveal className="wn-final__inner">
              <WaxSeal initials={initials} className="wn-final__seal" />
              <p className="wn-final__text">{finalMessage}</p>
              <p className="wn-names wn-names--small">{names}</p>
            </Reveal>
          </section>
        </>
      )}

      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
