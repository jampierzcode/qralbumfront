import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/cormorant-garamond/index.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource-variable/inter/index.css";
import Countdown, { useCountdown } from "../../experience-kit/Countdown.jsx";
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
  mapsLink,
  monogram,
  wazeLink,
  whatsappLink,
} from "../_wedding-kit/format.js";
import { Branch, Chevron, Frame } from "./Botanical.jsx";
import "../_wedding-kit/wedding-kit.css";
import "./styles.css";

/** Pantalla que se abre desde el menú (se cierra con la ✕, el fondo o Esc). */
function Sheet({ title, onClose, children }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose]);

  // Se renderiza DENTRO de la plantilla (no en un portal) para heredar sus colores.
  return (
    <div className="wc-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="wc-sheet__backdrop" onClick={onClose} aria-label="Cerrar" tabIndex={-1} />
      <div className="wc-sheet__panel">
        <div className="wc-sheet__bar">
          <span className="wc-sheet__handle" aria-hidden="true" />
          <h2 className="wc-sheet__title">{title}</h2>
          <button ref={closeRef} type="button" className="wc-sheet__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="wc-sheet__body">{children}</div>
      </div>
    </div>
  );
}

/**
 * Boda clásica. La portada es la pantalla de apertura y, al abrir, aparece un
 * menú: cada acceso abre su propia pantalla (ceremonia, ubicación, galería,
 * confirmación…) como en una app.
 */
export default function WeddingClassicExperience({ content, mode, onEvent, respond, env, opened, open }) {
  const {
    brideName, groomName, coverPhoto, quote, inviteMessage, accent = "navy",
    recipientName, passes, guestNote,
    eventDate, eventTime, venueName, address, reference, mapsUrl,
    receptionTime, receptionVenue, receptionAddress, receptionMapsUrl,
    dressCode, dressCodeNote, itinerary = [], giftsNote, giftsUrl, notes,
    rsvpEnabled, rsvpDeadline, hostPhone, rsvpNote,
    photos = [], hashtag, finalMessage,
  } = content;

  const isOpen = opened && mode !== "thumbnail";
  const [sheet, setSheet] = useState(null);
  const [viewer, setViewer] = useState(null);
  const names = [brideName, groomName].filter(Boolean).join(" & ");
  const date = dateParts(eventDate);
  const ceremonyAt = eventDateTime(eventDate, eventTime);
  const left = useCountdown(ceremonyAt);
  const storageKey = useMemo(() => `wedding-classic:${names}:${eventDate}`, [names, eventDate]);
  const finalRef = useRef(null);
  const finalVisible = useInView(finalRef, { threshold: 0.5 });
  const closeSheet = useCallback(() => setSheet(null), []);
  const agenda = calendarLink({
    title: `Boda de ${names}`,
    start: ceremonyAt,
    location: `${venueName || ""} ${address || ""}`.trim(),
    details: quote,
  });

  useEffect(() => {
    if (finalVisible) onEvent?.("completed");
  }, [finalVisible, onEvent]);

  const rsvpPanel = (
    <RsvpForm
      respond={respond}
      storageKey={storageKey}
      guestName={recipientName}
      passes={passes}
      deadline={rsvpDeadline}
      phone={hostPhone}
      coupleNames={names}
      className="wc-rsvp"
      copy={{ intro: rsvpNote || "" }}
    />
  );

  const tiles = [
    {
      id: "ceremonia",
      icon: "church",
      label: "Ceremonia",
      hint: venueName || "Dónde y a qué hora",
      show: Boolean(venueName || eventTime),
      panel: (
        <>
          <EventBlock
            eyebrow="Ceremonia"
            icon="church"
            time={eventTime}
            venue={venueName}
            address={address}
            reference={reference}
            mapsUrl={mapsUrl}
            className="wc-event"
          />
          {(receptionVenue || receptionAddress) && (
            <EventBlock
              eyebrow="Recepción"
              icon="glass"
              time={receptionTime}
              venue={receptionVenue}
              address={receptionAddress}
              mapsUrl={receptionMapsUrl}
              className="wc-event"
            />
          )}
          {agenda && (
            <a className="wk-btn wk-btn--ghost wc-sheet__cta" href={agenda} target="_blank" rel="noreferrer">
              <Icon name="calendar" />
              Agendar el día
            </a>
          )}
        </>
      ),
    },
    {
      id: "ubicacion",
      icon: "pin",
      label: "Ubicación",
      hint: "Cómo llegar",
      show: Boolean(address || venueName),
      panel: (
        <div className="wc-places">
          {[
            { title: "Ceremonia", venue: venueName, address, url: mapsUrl },
            { title: "Recepción", venue: receptionVenue, address: receptionAddress, url: receptionMapsUrl },
          ]
            .filter((place) => place.venue || place.address)
            .map((place) => (
              <article key={place.title} className="wc-place">
                <p className="wc-place__title">{place.title}</p>
                <p className="wc-place__venue">{place.venue}</p>
                <p className="wc-place__address">{place.address}</p>
                <div className="wc-place__actions">
                  <a className="wk-btn wk-btn--primary" href={mapsLink(place.venue, place.address, place.url)} target="_blank" rel="noreferrer">
                    <Icon name="pin" />
                    Google Maps
                  </a>
                  <a className="wk-btn wk-btn--ghost" href={wazeLink(place.venue, place.address)} target="_blank" rel="noreferrer">
                    Waze
                  </a>
                </div>
              </article>
            ))}
        </div>
      ),
    },
    {
      id: "itinerario",
      icon: "clock",
      label: "Itinerario",
      hint: "El plan del día",
      show: itinerary.length > 0,
      panel: <Timeline items={itinerary} className="wc-timeline" />,
    },
    {
      id: "vestimenta",
      icon: "dress",
      label: "Vestimenta",
      hint: DRESS_CODE_LABELS[dressCode] || "Código de vestimenta",
      show: Boolean(dressCode),
      panel: (
        <div className="wc-note">
          <p className="wc-note__value">{DRESS_CODE_LABELS[dressCode] || dressCode}</p>
          <p className="wc-note__text">{dressCodeNote || DRESS_CODE_HINTS[dressCode]}</p>
        </div>
      ),
    },
    {
      id: "galeria",
      icon: "camera",
      label: "Galería",
      hint: "Nuestra historia en fotos",
      show: photos.length > 0,
      panel: (
        <>
          <ul className="wc-gallery">
            {photos.map((photo, i) => (
              <li key={photo.id || i}>
                <button type="button" className="wc-gallery__item" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                  <Photo image={photo} sizes="(min-width: 700px) 30vw, 45vw" />
                </button>
              </li>
            ))}
          </ul>
          {hashtag && <p className="wc-hashtag">{hashtag}</p>}
        </>
      ),
    },
    {
      id: "regalos",
      icon: "gift",
      label: "Mesa de regalos",
      hint: "Si quieres obsequiarnos algo",
      show: Boolean(giftsNote || giftsUrl),
      panel: (
        <div className="wc-note">
          <p className="wc-note__text">{giftsNote}</p>
          {giftsUrl && (
            <a className="wk-btn wk-btn--primary wc-sheet__cta" href={giftsUrl} target="_blank" rel="noreferrer">
              Ver la mesa de regalos
            </a>
          )}
        </div>
      ),
    },
    {
      id: "notas",
      icon: "envelope",
      label: "Para tener en cuenta",
      hint: "Detalles útiles",
      show: Boolean(notes),
      panel: (
        <div className="wc-note">
          <p className="wc-note__text">{notes}</p>
        </div>
      ),
    },
    {
      id: "rsvp",
      icon: "heart",
      label: "Confirmar asistencia",
      hint: rsvpDeadline ? `Antes del ${formatLongDate(rsvpDeadline).toLowerCase()}` : "Te guardamos un lugar",
      show: rsvpEnabled !== false,
      panel: rsvpPanel,
    },
  ].filter((tile) => tile.show);

  const openTile = tiles.find((tile) => tile.id === sheet);

  return (
    <div className="wc" data-accent={accent} data-open={isOpen ? "true" : undefined}>
      {/* 1 · Portada a sangre */}
      <section className="wc-hero" aria-label="Portada">
        <div className="wc-hero__photo">
          <Photo image={coverPhoto} sizes="100vw" loading="eager" alt="" />
          <span className="wc-hero__veil" aria-hidden="true" />
        </div>
        <div className="wc-hero__body">
          <p className="wc-hero__eyebrow">Nuestra boda</p>
          <h1 className="wc-names">{names}</h1>
          {date && (
            <p className="wc-hero__date">
              {date.weekday} {date.day} de {date.month.toLowerCase()} de {date.year}
            </p>
          )}
          {quote && <p className="wc-hero__quote">{quote}</p>}
          {!isOpen && mode !== "thumbnail" ? (
            <button type="button" className="wk-btn wk-btn--primary wc-hero__open" data-gift-open onClick={open}>
              Abrir invitación
            </button>
          ) : (
            <p className="wc-hero__hint">Desliza</p>
          )}
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2 · Tarjeta de invitación */}
          <section className="wc-panel" aria-label="Invitación">
            <Reveal className="wc-card">
              <Frame />
              <Branch className="wc-branch--tl" />
              <Branch className="wc-branch--br" />
              <p className="wc-card__eyebrow">{monogram(brideName, groomName)}</p>
              <p className="wc-card__text">{inviteMessage}</p>
              {recipientName && (
                <div className="wc-guest">
                  <p className="wc-guest__label">Invitado</p>
                  <p className="wc-guest__name">{recipientName}</p>
                  {passes > 0 && (
                    <p className="wc-guest__passes">
                      {passes} {passes === 1 ? "acceso" : "accesos"}
                    </p>
                  )}
                  {guestNote && <p className="wc-guest__note">{guestNote}</p>}
                </div>
              )}
            </Reveal>
          </section>

          {/* 3 · Cuenta regresiva */}
          {ceremonyAt && (
            <section className="wc-panel wc-count" aria-label="Cuenta regresiva">
              <Reveal as="p" className="wc-eyebrow">
                {left?.done ? "¡Hoy es el gran día!" : "Faltan"}
              </Reveal>
              {!left?.done && <Countdown target={ceremonyAt} className="wk-countdown wc-countdown" />}
              {eventDate && <p className="wc-count__date">{formatLongDate(eventDate)}</p>}
            </section>
          )}

          {/* 4 · Menú de accesos */}
          <section className="wc-panel" aria-label="Menú de la invitación">
            <ul className="wc-menu">
              {tiles.map((tile, i) => (
                <Reveal as="li" key={tile.id} delay={(i % 4) * 70}>
                  <button type="button" className="wc-tile" onClick={() => setSheet(tile.id)}>
                    <Icon name={tile.icon} className="wc-tile__icon" />
                    <span className="wc-tile__body">
                      <strong>{tile.label}</strong>
                      <span>{tile.hint}</span>
                    </span>
                    <Chevron />
                  </button>
                </Reveal>
              ))}
            </ul>
          </section>

          {/* 5 · Llamada a confirmar */}
          {rsvpEnabled !== false && (
            <section className="wc-panel wc-cta" aria-label="Confirmar asistencia">
              <Reveal className="wc-cta__inner">
                <p className="wc-cta__quote">«Las mejores historias se comparten»</p>
                <button type="button" className="wk-btn wk-btn--primary wc-cta__button" onClick={() => setSheet("rsvp")}>
                  <Icon name="heart" />
                  Confirmar asistencia
                </button>
                {hostPhone && (
                  <a
                    className="wk-link"
                    href={whatsappLink(hostPhone, `¡Hola! Escribo por la boda de ${names}.`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="whatsapp" />
                    Escríbenos por WhatsApp
                  </a>
                )}
              </Reveal>
            </section>
          )}

          {/* 6 · Cierre */}
          <section className="wc-panel wc-final" ref={finalRef} aria-label="Gracias">
            <Reveal className="wc-final__inner">
              <Branch className="wc-branch--center" />
              <p className="wc-final__text">{finalMessage}</p>
              <p className="wc-names wc-names--small">{names}</p>
              {date && <p className="wc-final__date">{`${date.day}.${date.month.slice(0, 3).toLowerCase()}.${date.shortYear}`}</p>}
            </Reveal>
          </section>
        </>
      )}

      {openTile && (
        <Sheet title={openTile.label} onClose={closeSheet}>
          {openTile.panel}
        </Sheet>
      )}

      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
