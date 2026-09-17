import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/cormorant-garamond/index.css";
import "@fontsource/caveat/400.css";
import "@fontsource-variable/inter/index.css";
import Countdown, { useCountdown } from "../../experience-kit/Countdown.jsx";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import EventBlock from "../_wedding-kit/EventBlock.jsx";
import Icon from "../_wedding-kit/Icons.jsx";
import PhotoShare from "../_wedding-kit/PhotoShare.jsx";
import RsvpForm from "../_wedding-kit/RsvpForm.jsx";
import Timeline from "../_wedding-kit/Timeline.jsx";
import {
  DRESS_CODE_HINTS,
  DRESS_CODE_LABELS,
  calendarLink,
  dateParts,
  eventDateTime,
  formatDotDate,
  formatLongDate,
  monogram,
  whatsappLink,
} from "../_wedding-kit/format.js";
import { Arch, Branch } from "./Eucalyptus.jsx";
import "../_wedding-kit/wedding-kit.css";
import "./styles.css";

/**
 * Boda eucalipto: save the date + invitación con el pase del invitado y el
 * QR para que todos compartan sus fotos. La portada abre la experiencia.
 */
export default function WeddingGreeneryExperience({ content, mode, onEvent, respond, env, opened, open }) {
  const {
    brideName, groomName, coverPhoto, quote, inviteMessage, saveTheDate,
    recipientName, passes, guestNote,
    eventDate, eventTime, venueName, address, reference, mapsUrl,
    receptionTime, receptionVenue, receptionAddress, receptionMapsUrl,
    dressCode, dressCodeNote, itinerary = [], giftsNote,
    rsvpEnabled, rsvpDeadline, hostPhone, rsvpNote,
    photos = [], photoShareUrl, hashtag, finalMessage,
  } = content;

  const calm = env.reducedMotion || mode === "thumbnail" || env.tier === "low";
  const isOpen = opened && mode !== "thumbnail";
  const [viewer, setViewer] = useState(null);
  const names = [brideName, groomName].filter(Boolean).join(" y ");
  const initials = monogram(brideName, groomName, " | ");
  const date = dateParts(eventDate);
  const ceremonyAt = eventDateTime(eventDate, eventTime);
  const left = useCountdown(ceremonyAt);
  const storageKey = useMemo(() => `wedding-greenery:${names}:${eventDate}`, [names, eventDate]);
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
    <div className="wgr" data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      {/* 1 · Portada con la foto a sangre */}
      <section className="wgr-cover" aria-label="Portada">
        <div className="wgr-cover__photo">
          <Photo image={coverPhoto} sizes="100vw" loading="eager" alt="" />
          <span className="wgr-cover__veil" aria-hidden="true" />
        </div>
        <Branch className="wgr-branch--cover-tl" />
        <Branch className="wgr-branch--cover-br" />
        <div className="wgr-cover__body">
          <p className="wgr-eyebrow">Nuestra boda</p>
          <h1 className="wgr-names">{names}</h1>
          {eventDate && <p className="wgr-cover__date">{formatDotDate(eventDate)}</p>}
          {!isOpen && mode !== "thumbnail" ? (
            <button type="button" className="wgr-open" data-gift-open onClick={open}>
              Abrir invitación
            </button>
          ) : (
            <p className="wgr-cover__hint">Desliza</p>
          )}
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2 · Save the date */}
          {saveTheDate !== false && (
            <section className="wgr-panel" aria-label="Save the date">
              <Reveal className="wgr-save">
                <Arch className="wgr-save__arch" />
                <div className="wgr-save__inner">
                  <p className="wgr-save__title">Save the Date</p>
                  <p className="wgr-save__names">{names}</p>
                  {eventDate && <p className="wgr-save__date">{formatDotDate(eventDate)}</p>}
                  {quote && <p className="wgr-save__quote">{quote}</p>}
                </div>
              </Reveal>
            </section>
          )}

          {/* 3 · La invitación y el pase del invitado */}
          <section className="wgr-panel" aria-label="Invitación">
            <Reveal className="wgr-invite">
              <Branch className="wgr-branch--card-tl" />
              <Branch className="wgr-branch--card-br" />
              <span className="wgr-monogram">{initials}</span>
              <p className="wgr-invite__text">{inviteMessage}</p>
              {recipientName && (
                <div className="wgr-pass">
                  <p className="wgr-pass__label">Invitado</p>
                  <p className="wgr-pass__name">{recipientName}</p>
                  {passes > 0 && (
                    <p className="wgr-pass__passes">
                      <Icon name="heart" />
                      Número de accesos: <strong>{passes}</strong>
                    </p>
                  )}
                  {guestNote && <p className="wgr-pass__note">{guestNote}</p>}
                </div>
              )}
              {eventDate && <p className="wgr-invite__date">{formatDotDate(eventDate)}</p>}
            </Reveal>
          </section>

          {/* 4 · Cuenta regresiva */}
          {ceremonyAt && (
            <section className="wgr-panel wgr-count" aria-label="Cuenta regresiva">
              <Reveal as="p" className="wgr-script">
                {left?.done ? "¡Hoy es el día!" : "Faltan"}
              </Reveal>
              {!left?.done && <Countdown target={ceremonyAt} className="wk-countdown wgr-countdown" />}
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

          {/* 5 · Ceremonia y recepción */}
          <section className="wgr-panel" aria-label="Ceremonia y recepción">
            <Reveal as="h2" className="wgr-heading">
              El gran día
            </Reveal>
            {eventDate && (
              <Reveal as="p" className="wgr-sub" delay={60}>
                {formatLongDate(eventDate)}
              </Reveal>
            )}
            <div className="wgr-events">
              <Reveal delay={120}>
                <EventBlock
                  eyebrow="Ceremonia"
                  icon="rings"
                  time={eventTime}
                  venue={venueName}
                  address={address}
                  reference={reference}
                  mapsUrl={mapsUrl}
                  className="wgr-event"
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
                    className="wgr-event"
                  />
                </Reveal>
              )}
            </div>
          </section>

          {/* 6 · Detalles */}
          {(dressCode || itinerary.length > 0 || giftsNote) && (
            <section className="wgr-panel" aria-label="Detalles">
              <Reveal as="h2" className="wgr-heading">
                Detalles
              </Reveal>
              <div className="wgr-details">
                {dressCode && (
                  <Reveal className="wgr-detail" delay={80}>
                    <Icon name="dress" className="wgr-detail__icon" />
                    <p className="wgr-detail__title">Vestimenta</p>
                    <p className="wgr-detail__value">{DRESS_CODE_LABELS[dressCode] || dressCode}</p>
                    <p className="wgr-detail__note">{dressCodeNote || DRESS_CODE_HINTS[dressCode]}</p>
                  </Reveal>
                )}
                {itinerary.length > 0 && (
                  <Reveal className="wgr-detail wgr-detail--wide" delay={140}>
                    <Icon name="clock" className="wgr-detail__icon" />
                    <p className="wgr-detail__title">Itinerario</p>
                    <Timeline items={itinerary} />
                  </Reveal>
                )}
                {giftsNote && (
                  <Reveal className="wgr-detail" delay={200}>
                    <Icon name="gift" className="wgr-detail__icon" />
                    <p className="wgr-detail__title">Mesa de regalos</p>
                    <p className="wgr-detail__note">{giftsNote}</p>
                  </Reveal>
                )}
              </div>
            </section>
          )}

          {/* 7 · Confirmación */}
          {rsvpEnabled !== false && (
            <section className="wgr-panel" aria-label="Confirmar asistencia">
              <Reveal as="h2" className="wgr-heading">
                Confirma tu asistencia
              </Reveal>
              {rsvpNote && (
                <Reveal as="p" className="wgr-sub" delay={60}>
                  {rsvpNote}
                </Reveal>
              )}
              <Reveal delay={120} className="wgr-rsvp-wrap">
                <RsvpForm
                  respond={respond}
                  storageKey={storageKey}
                  guestName={recipientName}
                  passes={passes}
                  deadline={rsvpDeadline}
                  phone={hostPhone}
                  coupleNames={names}
                  className="wgr-rsvp"
                />
              </Reveal>
            </section>
          )}

          {/* 8 · Galería */}
          {photos.length > 0 && (
            <section className="wgr-panel" aria-label="Galería">
              <Reveal as="h2" className="wgr-heading">
                Nuestra historia
              </Reveal>
              <ul className="wgr-gallery">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 90}>
                    <button type="button" className="wgr-gallery__item" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 900px) 26vw, 45vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 9 · Comparte tus fotos */}
          {photoShareUrl && (
            <section className="wgr-panel" aria-label="Comparte tus fotos">
              <Reveal delay={60} className="wgr-share-wrap">
                <PhotoShare
                  url={photoShareUrl}
                  hashtag={hashtag}
                  text="Escanea el código y sube al álbum las fotos que tomes en nuestra boda."
                  fg="#2f4534"
                  className="wgr-share"
                />
              </Reveal>
            </section>
          )}

          {/* 10 · Cierre */}
          <section className="wgr-panel wgr-final" ref={finalRef} aria-label="Gracias">
            {!calm && <Particles className="wgr-petals" kind="pollen" color="#cfe0c6" density={0.6} max={26} />}
            <Reveal className="wgr-final__inner">
              <span className="wgr-monogram wgr-monogram--light">{initials}</span>
              <p className="wgr-final__text">{finalMessage}</p>
              <p className="wgr-names wgr-names--small">{names}</p>
              {date && <p className="wgr-final__date">{formatDotDate(eventDate)}</p>}
              {hostPhone && (
                <a
                  className="wk-link"
                  href={whatsappLink(hostPhone, `¡Hola! Escribo por la boda de ${names}.`)}
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
