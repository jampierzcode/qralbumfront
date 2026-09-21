import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/caveat/700.css";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import { timeTogether } from "../../experience-kit/timeTogether.js";
import Fireflies from "./Fireflies.jsx";
import Lamp from "./Lamp.jsx";
import "./styles.css";

// Colores de la luz (el admin elige uno). main = brillo, soft = centro de la llama, deep = borde cálido.
const GLOWS = {
  gold: { main: "#ffc83d", soft: "#fff0b0", deep: "#ff9f1c" },
  amber: { main: "#ff9f1c", soft: "#ffd9a0", deep: "#e8590c" },
  honey: { main: "#f7b32b", soft: "#fff3c4", deep: "#d98a00" },
};

// Inclinación estable de cada foto colgada.
const TILTS = [-2.6, 2, -1.4, 2.8, -2.2, 1.2, -3, 2.4, -1, 2.6, -1.8, 1.6];

function Letter({ message, senderName, since }) {
  const ref = useRef(null);
  const visible = useInView(ref, { threshold: 0.25 });
  const words = useMemo(() => message.split(/(\s+)/), [message]);
  let wordIndex = 0;

  return (
    <section className="yl-letter" id="yl-letter" aria-label="Mensaje">
      <div className="yl-letter__inner" ref={ref} data-visible={visible ? "true" : undefined}>
        <p className="yl-kicker">Una carta para ti</p>
        <p className="yl-letter__text">
          {words.map((part, i) => {
            if (/^\s+$/.test(part)) return part;
            const delay = Math.min(wordIndex++ * 45, 3200);
            return (
              <span key={i} className="yl-word" style={{ "--wd": `${delay}ms` }}>
                {part}
              </span>
            );
          })}
        </p>
        {senderName && <p className="yl-letter__signature">— {senderName}</p>}
        {since && (
          <div className="yl-since">
            <span className="yl-since__label">Desde el {since.label}</span>
            <span className="yl-since__value">{since.text}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Memories({ photos, onOpen }) {
  return (
    <section className="yl-memories" aria-label="Recuerdos">
      <Reveal as="header" className="yl-section-head">
        <p className="yl-kicker">Recuerdos con luz</p>
        <h2 className="yl-heading">Cada foto, una lucecita</h2>
      </Reveal>
      <ul className="yl-hangs">
        {photos.map((photo, i) => (
          <Reveal as="li" key={photo.id || i} className="yl-hang" delay={(i % 3) * 90} style={{ "--tilt": `${TILTS[i % TILTS.length]}deg`, "--sway": `${4.5 + (i % 4) * 0.7}s` }}>
            <div className="yl-swing">
              <span className="yl-hang__string" aria-hidden="true">
                <i />
              </span>
              <button type="button" className="yl-frame" onClick={() => onOpen(i)} aria-label={`Ver recuerdo ${i + 1} de ${photos.length}`}>
                <Photo image={photo} sizes="(min-width: 1024px) 30vw, (min-width: 700px) 44vw, 84vw" />
              </button>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Videos({ videos, audio }) {
  return (
    <section className="yl-videos" aria-label="Videos">
      <Reveal as="header" className="yl-section-head">
        <p className="yl-kicker">Momentos en movimiento</p>
      </Reveal>
      <div className="yl-videos__list">
        {videos.map((video, i) => (
          <Reveal key={video.id || i} className="yl-video">
            <video src={video.src} controls playsInline preload="metadata" onPlay={() => audio.duck()} onPause={() => audio.unduck()} onEnded={() => audio.unduck()} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Lámpara de flores amarillas. La cúpula apagada ES la pantalla de apertura: al tocarla (dentro del gesto,
 * para desbloquear la música) se enciende, la flor brilla entre el hilo de luces y aparecen luciérnagas.
 */
export default function YellowLanternExperience({ content, mode, audio, onEvent, env, opened, open }) {
  const { recipientName, senderName, title, message, importantDate, photos = [], videos = [], flower = "sunflower", glow = "gold", fireflies = true } = content;
  const [viewer, setViewer] = useState(null);
  const since = useMemo(() => timeTogether(importantDate), [importantDate]);
  const finaleRef = useRef(null);
  const finaleVisible = useInView(finaleRef, { threshold: 0.5 });
  const low = env.tier === "low";
  const calm = env.reducedMotion || mode === "thumbnail";
  const lit = Boolean(opened);
  const colors = GLOWS[glow] || GLOWS.gold;
  const flies = !fireflies ? 0 : low ? 10 : env.tier === "high" ? 28 : 18;

  useEffect(() => {
    if (lit && finaleVisible) onEvent?.("completed");
  }, [lit, finaleVisible, onEvent]);

  const playableVideos = videos.filter((v) => v?.src);
  const style = { "--yl-glow": colors.main, "--yl-glow-soft": colors.soft, "--yl-glow-deep": colors.deep };

  return (
    <main className="yl" style={style} data-lit={lit ? "true" : undefined} data-calm={calm ? "true" : undefined} data-tier={env.tier}>
      <div className="yl-sky" aria-hidden="true" />
      <Fireflies count={flies} active={lit} calm={calm} />

      <section className="yl-hero" aria-label="Portada">
        <div className="yl-hero__text">
          <p className="yl-eyebrow">{lit ? (recipientName ? `Para ${recipientName}` : "Para ti") : "Tienes un regalo"}</p>
          <h1 className="yl-title">{title}</h1>
          {senderName && <p className="yl-from">con cariño, {senderName}</p>}
        </div>

        <div className="yl-stage">
          <span className="yl-halo" aria-hidden="true" />
          <span className="yl-floor" aria-hidden="true" />
          <button type="button" className="yl-lamp-btn" {...(!lit ? { "data-gift-open": "" } : {})} onClick={open} disabled={lit} aria-label={lit ? "Lámpara encendida" : "Encender la lámpara"}>
            <Lamp flower={flower} lit={lit} />
            {recipientName && <span className="yl-tag">Para {recipientName}</span>}
            {!lit && <span className="yl-pulse" aria-hidden="true" />}
          </button>
        </div>

        {!lit ? (
          <p className="yl-hint">Toca la lámpara para encenderla</p>
        ) : (
          (message || photos.length > 0) &&
          mode !== "thumbnail" && (
            <a className="yl-scroll" href="#yl-letter" onClick={(e) => (e.preventDefault(), document.getElementById("yl-letter")?.scrollIntoView({ behavior: calm ? "auto" : "smooth" }))}>
              <span>Desliza</span>
              <i aria-hidden="true" />
            </a>
          )
        )}
      </section>

      {lit && (
        <>
          {message && <Letter message={message} senderName={senderName} since={since} />}
          {photos.length > 0 && <Memories photos={photos} onOpen={setViewer} />}
          {playableVideos.length > 0 && <Videos videos={playableVideos} audio={audio} />}

          <section className="yl-finale" ref={finaleRef} aria-label="Final">
            <Reveal className="yl-finale__text">
              <p className="yl-kicker">{recipientName ? `Para ti, ${recipientName}` : "Para ti"}</p>
              <p className="yl-finale__line">Que nunca te falte luz</p>
              {senderName && <p className="yl-finale__signature">{senderName}</p>}
              <button type="button" className="yl-replay" onClick={() => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" })}>
                Ver de nuevo
              </button>
            </Reveal>
            <div className="yl-finale__lamp" aria-hidden="true">
              <span className="yl-halo yl-halo--small" />
              <Lamp flower={flower} lit />
            </div>
          </section>
        </>
      )}

      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </main>
  );
}
