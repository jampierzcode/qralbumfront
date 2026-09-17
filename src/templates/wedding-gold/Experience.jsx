import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource/great-vibes/400.css";
import "@fontsource-variable/cormorant-garamond/index.css";
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
  monogram,
  whatsappLink,
} from "../_wedding-kit/format.js";
import { Corner, Divider, Leaves, Ring } from "./Ornaments.jsx";
import "../_wedding-kit/wedding-kit.css";
import "./styles.css";

/**
 * Boda dorada. La portada con el sello ES la pantalla de apertura:
 * llama a open() dentro del gesto para desbloquear la música.
 */
export default function WeddingGoldExperience({ content, mode, onEvent, respond, env, opened, open }) {
  const {
    brideName, groomName, coverPhoto, quote, inviteMessage, palette = "gold",
    recipientName, passes, guestNote,
    eventDate, eventTime, venueName, address, reference, mapsUrl,
    receptionTime, receptionVenue, receptionAddress, receptionMapsUrl,
    dressCode, dressCodeNote, itinerary = [], giftsNote,
    rsvpEnabled, rsvpDeadline, hostPhone, rsvpNote,
    photos = [], finalMessage,
  } = content;

  const calm = env.reducedMotion || mode === "thumbnail" || env.tier === "low";
  const isOpen = opened && mode !== "thumbnail";
  const [viewer, setViewer] = useState(null);
  const names = [brideName, groomName].filter(Boolean).join(" & ");
  const date = dateParts(eventDate);
  const ceremonyAt = eventDateTime(eventDate, eventTime);
  const left = useCountdown(ceremonyAt);
  const storageKey = useMemo(() => `wedding-gold:${names}:${eventDate}`, [names, eventDate]);
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

  const frame = (
    <>
      <Corner className="wg-corner--tl" />
      <Corner className="wg-corner--tr" />
      <Corner className="wg-corner--bl" />
      <Corner className="wg-corner--br" />
    </>
  );

  return (
    <div className="wg" data-palette={palette} data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      <div className="wg-bg" aria-hidden="true">
        <span className="wg-bg__marble" />
        <Leaves className="wg-leaves--tl" />
        <Leaves className="wg-leaves--br" />
        {!calm && <Particles className="wg-dust" kind="sparkles" color="#d8bd86" density={0.5} max={26} />}
      </div>

      {/* 1 · Portada */}
      <section className="wg-panel wg-cover" aria-label="Portada">
        <div className="wg-card wg-cover__card">
          {frame}
          <p className="wg-cover__eyebrow">Nuestra boda</p>
          <div className="wg-cover__photo">
            <Photo image={coverPhoto} sizes="(min-width: 900px) 36vw, 78vw" loading="eager" alt="" />
          </div>
          <h1 className="wg-names">{names}</h1>
          <Divider className="wg-divider--cover" />
          {date && (
            <p className="wg-cover__date">
              <span>{date.weekday}</span>
              <strong>
                {date.day} · {date.month}
              </strong>
              <span>{date.year}</span>
            </p>
          )}
          {quote && <p className="wg-cover__quote">{quote}</p>}
          {!isOpen && mode !== "thumbnail" && (
            <button type="button" className="wg-seal" data-gift-open onClick={open} aria-label="Abrir la invitación">
              <Ring />
              <span>Abrir invitación</span>
            </button>
          )}
          {isOpen && <p className="wg-hint">Desliza para ver todos los detalles</p>}
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2 · La invitación */}
          <section className="wg-panel" aria-label="Invitación">
            <Reveal className="wg-card wg-invite">
              {frame}
              <Ring className="wg-invite__ring" />
              <h2 className="wg-heading">{monogram(brideName, groomName)}</h2>
              <p className="wg-invite__text">{inviteMessage}</p>
              <Divider />
              {recipientName && (
                <div className="wg-pass">
                  <p className="wg-pass__label">Invitado de honor</p>
                  <p className="wg-pass__name">{recipientName}</p>
                  {passes > 0 && (
                    <p className="wg-pass__passes">
                      <Icon name="heart" />
                      {passes} {passes === 1 ? "acceso" : "accesos"}
                    </p>
                  )}
                  {guestNote && <p className="wg-pass__note">{guestNote}</p>}
                </div>
              )}
            </Reveal>
          </section>

          {/* 3 · Cuenta regresiva */}
          {ceremonyAt && (
            <section className="wg-panel wg-count" aria-label="Cuenta regresiva">
              <Reveal as="h2" className="wg-heading">
                {left?.done ? "¡Hoy es el gran día!" : "Faltan"}
              </Reveal>
              {!left?.done && <Countdown target={ceremonyAt} className="wk-countdown wg-countdown" />}
              {agenda && (
                <Reveal delay={120}>
                  <a className="wk-btn wk-btn--ghost" href={agenda} target="_blank" rel="noreferrer">
                    <Icon name="calendar" />
                    Agendar el día
                  </a>
                </Reveal>
              )}
            </section>
          )}

          {/* 4 · Ceremonia y recepción */}
          <section className="wg-panel" aria-label="Ceremonia y recepción">
            <Reveal as="h2" className="wg-heading">
              El gran día
            </Reveal>
            {eventDate && (
              <Reveal className="wg-longdate" delay={80}>
                {formatLongDate(eventDate)}
              </Reveal>
            )}
            <div className="wg-events">
              <Reveal delay={120}>
                <EventBlock
                  eyebrow="Ceremonia"
                  icon="church"
                  time={eventTime}
                  venue={venueName}
                  address={address}
                  reference={reference}
                  mapsUrl={mapsUrl}
                  className="wg-event"
                />
              </Reveal>
              {(receptionVenue || receptionAddress) && (
                <Reveal delay={200}>
                  <EventBlock
                    eyebrow="Recepción"
                    icon="glass"
                    time={receptionTime}
                    venue={receptionVenue}
                    address={receptionAddress}
                    mapsUrl={receptionMapsUrl}
                    className="wg-event"
                  />
                </Reveal>
              )}
            </div>
          </section>

          {/* 5 · Detalles */}
          {(dressCode || itinerary.length > 0 || giftsNote) && (
            <section className="wg-panel" aria-label="Detalles">
              <Reveal as="h2" className="wg-heading">
                Detalles
              </Reveal>
              <div className="wg-details">
                {dressCode && (
                  <Reveal className="wg-card wg-detail" delay={100}>
                    <Icon name="dress" className="wg-detail__icon" />
                    <p className="wg-detail__title">Código de vestimenta</p>
                    <p className="wg-detail__value">{DRESS_CODE_LABELS[dressCode] || dressCode}</p>
                    <p className="wg-detail__note">{dressCodeNote || DRESS_CODE_HINTS[dressCode]}</p>
                  </Reveal>
                )}
                {itinerary.length > 0 && (
                  <Reveal className="wg-card wg-detail wg-detail--wide" delay={160}>
                    <Icon name="clock" className="wg-detail__icon" />
                    <p className="wg-detail__title">Itinerario</p>
                    <Timeline items={itinerary} />
                  </Reveal>
                )}
                {giftsNote && (
                  <Reveal className="wg-card wg-detail" delay={220}>
                    <Icon name="gift" className="wg-detail__icon" />
                    <p className="wg-detail__title">Mesa de regalos</p>
                    <p className="wg-detail__note">{giftsNote}</p>
                  </Reveal>
                )}
              </div>
            </section>
          )}

          {/* 6 · Confirmación */}
          {rsvpEnabled !== false && (
            <section className="wg-panel" aria-label="Confirmar asistencia">
              <Reveal as="h2" className="wg-heading">
                Confirma tu asistencia
              </Reveal>
              {rsvpNote && (
                <Reveal className="wg-longdate" delay={80}>
                  {rsvpNote}
                </Reveal>
              )}
              <Reveal delay={140} className="wg-rsvp-wrap">
                <RsvpForm
                  respond={respond}
                  storageKey={storageKey}
                  guestName={recipientName}
                  passes={passes}
                  deadline={rsvpDeadline}
                  phone={hostPhone}
                  coupleNames={names}
                  className="wg-rsvp"
                />
              </Reveal>
            </section>
          )}

          {/* 7 · Galería */}
          {photos.length > 0 && (
            <section className="wg-panel" aria-label="Galería">
              <Reveal as="h2" className="wg-heading">
                Nuestra historia
              </Reveal>
              <ul className="wg-gallery">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 90}>
                    <button type="button" className="wg-gallery__item" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 900px) 26vw, 45vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 8 · Cierre */}
          <section className="wg-panel wg-final" ref={finalRef} aria-label="Gracias">
            <Reveal className="wg-card wg-final__card">
              {frame}
              <Ring className="wg-invite__ring" />
              <p className="wg-final__text">{finalMessage}</p>
              <h2 className="wg-names wg-names--small">{names}</h2>
              {hostPhone && (
                <a
                  className="wk-link"
                  href={whatsappLink(hostPhone, `¡Hola! Tengo una duda sobre la boda de ${names}.`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="whatsapp" />
                  ¿Dudas? Escríbenos
                </a>
              )}
            </Reveal>
          </section>
        </>
      )}

      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
