import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource/great-vibes/400.css";
import "@fontsource-variable/cormorant-garamond/index.css";
import "@fontsource-variable/nunito/index.css";
import ConfettiBurst from "../../experience-kit/ConfettiBurst.jsx";
import Countdown from "../../experience-kit/Countdown.jsx";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import { useAudioState } from "../../experience-kit/useAudioState.js";
import "./styles.css";

const TILTS = [-4, 3, -2, 5, -3, 2, -5, 4];
const CONFETTI = {
  classic: ["#e2b25a", "#f2b8c6", "#fff6ee", "#b98ba0"],
  modern: ["#ff3ea5", "#3ef0ff", "#ffe14d", "#9b5cff"],
  minimal: ["#e38aa0", "#d9c2a0", "#2b2522", "#f4d6dd"],
};

function nextBirthday(iso) {
  if (!iso) return null;
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(now.getFullYear(), m - 1, d);
  if (target < today) target = new Date(now.getFullYear() + 1, m - 1, d);
  return { date: target, isToday: target.getTime() === today.getTime() };
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return "0:00";
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}

function Heart({ className = "" }) {
  return (
    <svg className={`bd-heart ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.2.3.8.3 1 0 .7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function Balloons({ count = 5 }) {
  return (
    <div className="bd-balloons" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`bd-balloon bd-balloon--${i + 1}`}>
          <i />
        </span>
      ))}
    </div>
  );
}

function CoverMedia({ photo, video, calm }) {
  if (video?.src && !calm) {
    return <video className="bd-cover__media" src={video.src} poster={photo?.src} muted playsInline autoPlay loop preload="metadata" />;
  }
  return <Photo image={photo} className="bd-cover__media" sizes="100vw" loading="eager" />;
}

function Player({ audio, title, artist, art }) {
  const { playing, available } = useAudioState(audio);
  const [pos, setPos] = useState({ current: 0, duration: 0 });
  const ref = useRef(null);
  const visible = useInView(ref, { once: false, threshold: 0.1 });

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    let last = 0;
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 250) return;
      last = t;
      setPos(audio.getPosition());
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audio, visible]);

  if (!available) return null;
  const ratio = pos.duration ? pos.current / pos.duration : 0;

  return (
    <div className="bd-player" ref={ref}>
      <div className="bd-player__head">
        {art && <Photo image={art} className="bd-player__art" sizes="64px" />}
        <div className="bd-player__meta">
          <strong>{title || "Tu canción"}</strong>
          {artist && <span>{artist}</span>}
        </div>
        <span className={`bd-player__eq ${playing ? "is-on" : ""}`} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <input
        className="bd-player__bar"
        type="range"
        min={0}
        max={pos.duration || 1}
        step={0.5}
        value={pos.current}
        style={{ "--p": `${ratio * 100}%` }}
        onChange={(e) => {
          audio.seek(Number(e.target.value));
          setPos((p) => ({ ...p, current: Number(e.target.value) }));
        }}
        aria-label="Posición de la canción"
      />
      <div className="bd-player__times">
        <span>{formatTime(pos.current)}</span>
        <span>{formatTime(pos.duration)}</span>
      </div>
      <div className="bd-player__controls">
        <button type="button" onClick={() => audio.seek(pos.current - 10)} aria-label="Retroceder 10 segundos">
          ↺<small>10</small>
        </button>
        <button type="button" className="bd-player__play" onClick={() => audio.toggle()} aria-label={playing ? "Pausar" : "Reproducir"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" onClick={() => audio.seek(pos.current + 10)} aria-label="Adelantar 10 segundos">
          ↻<small>10</small>
        </button>
      </div>
    </div>
  );
}

/**
 * Feliz cumpleaños. La portada es la pantalla de apertura (gate: "template").
 */
export default function BirthdayExperience({ content, mode, audio, onEvent, env, opened, open }) {
  const {
    recipientName, senderName, birthDate, coverPhoto, coverVideo, greeting, introTitle, message, photoCaption,
    photos = [], songTitle, songArtist, song, noteMessage, noteSignature, friendMessages = [], style = "classic",
  } = content;
  const calm = env.reducedMotion || mode === "thumbnail";
  const [burst, setBurst] = useState(0);
  const [viewer, setViewer] = useState(null);
  const [tab, setTab] = useState("photos");
  const momentsRef = useRef(null);
  const finalRef = useRef(null);
  const finalVisible = useInView(finalRef, { threshold: 0.45 });
  const birthday = useMemo(() => nextBirthday(birthDate), [birthDate]);
  const messages = friendMessages.filter((m) => m?.name && m?.message);
  const isOpen = opened && mode !== "thumbnail";
  const allPhotos = useMemo(() => (coverPhoto ? [coverPhoto, ...photos] : photos), [coverPhoto, photos]);

  useEffect(() => {
    if (finalVisible) {
      onEvent?.("completed");
      if (!calm) setBurst((b) => b + 1);
    }
  }, [finalVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    if (isOpen || mode === "thumbnail") return;
    open(); // en el gesto: desbloquea la música
    if (!calm) setBurst((b) => b + 1);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `Feliz cumpleaños ${recipientName}`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* cancelado por el usuario */
    }
  };

  const title = (
    <>
      {greeting}
      <br />
      <span className="bd-title__name">
        {recipientName}!<Heart className="bd-title__heart" />
      </span>
    </>
  );

  return (
    <div className="bd" data-style={style} data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      {/* 1. Portada */}
      <section className="bd-cover" aria-label="Portada">
        <CoverMedia photo={coverPhoto} video={coverVideo} calm={calm} />
        <div className="bd-cover__shade" />
        <div className="bd-cover__content">
          <h1 className="bd-title">{title}</h1>
          {!isOpen ? (
            <button type="button" className="bd-play" data-gift-open onClick={start} aria-label="Comenzar la sorpresa" disabled={mode === "thumbnail"}>
              <span className="bd-play__ring" />
              <span className="bd-play__icon">▶</span>
            </button>
          ) : (
            senderName && <p className="bd-cover__from">con amor, {senderName}</p>
          )}
          <p className="bd-cover__hint">{isOpen ? "Desliza" : "Toca para comenzar"}</p>
          <i className="bd-chevron" aria-hidden="true" />
        </div>
      </section>

      {isOpen && (
        <>
          {/* 2. Mensaje */}
          <section className="bd-section bd-intro" aria-label="Mensaje">
            {!calm && <Particles className="bd-stars" kind="sparkles" color={style === "minimal" ? "#d9c2a0" : "#f7dca0"} density={0.6} max={50} />}
            <div className="bd-intro__grid">
              <Reveal className="bd-intro__text">
                <h2 className="bd-heading">{introTitle}</h2>
                <p className="bd-lead">{message}</p>
                <Heart className="bd-intro__heart" />
              </Reveal>
              {photos[0] && (
                <Reveal variant="scale" delay={200} className="bd-polaroid bd-polaroid--hero" style={{ "--tilt": "-3deg" }}>
                  <Photo image={photos[0]} sizes="(min-width: 900px) 34vw, 78vw" />
                  {photoCaption && <span className="bd-polaroid__caption">{photoCaption}</span>}
                  <Heart className="bd-polaroid__sticker" />
                </Reveal>
              )}
            </div>
          </section>

          {/* 3. Momentos */}
          <section className="bd-section bd-moments" ref={momentsRef} aria-label="Momentos">
            <Reveal as="header" className="bd-section__head">
              <h2 className="bd-heading">
                Momentos
                <br />
                <em>que te hacen única</em>
              </h2>
              {messages.length > 0 && (
                <div className="bd-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={tab === "photos"} onClick={() => setTab("photos")}>
                    Fotos
                  </button>
                  <button type="button" role="tab" aria-selected={tab === "messages"} onClick={() => setTab("messages")}>
                    Mensajes
                  </button>
                </div>
              )}
            </Reveal>

            {tab === "photos" ? (
              <ul className="bd-collage">
                {photos.map((photo, i) => (
                  <Reveal as="li" key={photo.id || i} delay={(i % 3) * 80} className="bd-collage__item" style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` }}>
                    <button type="button" className="bd-polaroid" onClick={() => setViewer(i + 1)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 900px) 24vw, 45vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            ) : (
              <ul className="bd-notes">
                {messages.map((m, i) => (
                  <Reveal as="li" key={i} delay={(i % 3) * 90} className="bd-note" style={{ "--tilt": `${TILTS[(i + 2) % TILTS.length] / 2}deg` }}>
                    <p>{m.message}</p>
                    <strong>{m.name}</strong>
                  </Reveal>
                ))}
              </ul>
            )}
          </section>

          {/* 4. Cuenta regresiva */}
          {birthday && (
            <section className="bd-section bd-count" aria-label="Cuenta regresiva">
              <Reveal>
                <h2 className="bd-heading">{birthday.isToday ? "¡Hoy es tu día!" : "Faltan"}</h2>
                {!birthday.isToday && (
                  <>
                    <Countdown target={birthday.date} className="bd-countdown" />
                    <p className="bd-lead bd-count__sub">para tu cumpleaños</p>
                  </>
                )}
              </Reveal>
            </section>
          )}

          {/* 5. Canción + nota */}
          <section className="bd-section bd-song" aria-label="Canción">
            <Reveal as="header" className="bd-section__head">
              <h2 className="bd-heading">
                {song ? "Esta canción" : "Unas palabras"}
                <br />
                <em>
                  {song ? "es para ti" : "para ti"} <Heart className="bd-inline-heart" />
                </em>
              </h2>
            </Reveal>
            <div className="bd-song__grid">
              {song && (
                <Reveal>
                  <Player audio={audio} title={songTitle} artist={songArtist} art={coverPhoto || photos[0]} />
                </Reveal>
              )}
              <Reveal delay={150} className="bd-letter">
                <p>{noteMessage}</p>
                <Heart className="bd-letter__heart" />
                {noteSignature && <p className="bd-letter__signature">{noteSignature}</p>}
              </Reveal>
            </div>
          </section>

          {/* 6. Final */}
          <section className="bd-final" ref={finalRef} aria-label="Final">
            <CoverMedia photo={coverPhoto} video={null} calm />
            <div className="bd-cover__shade bd-final__shade" />
            <Balloons count={env.tier === "low" ? 3 : 5} />
            {!calm && <Particles className="bd-final__confetti" kind="confetti" colors={CONFETTI[style]} density={0.7} max={env.tier === "low" ? 20 : 45} active={finalVisible} />}
            <div className="bd-final__content">
              <h2 className="bd-title bd-title--final">{title}</h2>
              <div className="bd-final__actions">
                <button type="button" className="bd-pill" onClick={() => setViewer(0)}>
                  Ver todas las fotos
                </button>
                {messages.length > 0 && (
                  <button
                    type="button"
                    className="bd-pill"
                    onClick={() => {
                      setTab("messages");
                      momentsRef.current?.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
                    }}
                  >
                    Leer mensajes
                  </button>
                )}
                {mode === "live" && (
                  <button type="button" className="bd-pill" onClick={share}>
                    Compartir este regalo
                  </button>
                )}
              </div>
              {senderName && <p className="bd-final__from">Con amor, {senderName}</p>}
            </div>
          </section>
        </>
      )}

      <ConfettiBurst trigger={burst} colors={CONFETTI[style]} />
      <PhotoViewer photos={allPhotos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
