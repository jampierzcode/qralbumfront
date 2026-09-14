import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import Garden from "./Garden.jsx";
import "./styles.css";

const dateFmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function timeTogether(isoDate) {
  if (!isoDate) return null;
  const start = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime())) return null;
  const now = new Date();
  const label = dateFmt.format(start);
  if (start > now) {
    const days = Math.ceil((start - now) / 86400000);
    return { label, text: days === 1 ? "Falta 1 día" : `Faltan ${days} días` };
  }
  let years = now.getUTCFullYear() - start.getUTCFullYear();
  let months = now.getUTCMonth() - start.getUTCMonth();
  let days = now.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const parts = [
    years && `${years} ${years === 1 ? "año" : "años"}`,
    months && `${months} ${months === 1 ? "mes" : "meses"}`,
    days && `${days} ${days === 1 ? "día" : "días"}`,
  ].filter(Boolean);
  const text = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} y ${parts.at(-1)}` : parts[0] || "Hoy";
  return { label, text };
}

// Posición "desordenada" pero estable de cada polaroid.
const TILTS = [-3.2, 2.4, -1.6, 3.4, -2.6, 1.4, -3.8, 2.8, -1.2, 3, -2.2, 1.8];

function Letter({ message, senderName, since }) {
  const ref = useRef(null);
  const visible = useInView(ref, { threshold: 0.25 });
  const words = useMemo(() => message.split(/(\s+)/), [message]);
  let wordIndex = 0;

  return (
    <section className="yf-letter" id="yf-letter" aria-label="Mensaje">
      <div className="yf-letter__inner" ref={ref} data-visible={visible ? "true" : undefined}>
        <p className="yf-kicker">Una carta para ti</p>
        <p className="yf-letter__text">
          {words.map((part, i) => {
            if (/^\s+$/.test(part)) return part;
            const delay = Math.min(wordIndex++ * 45, 3200);
            return (
              <span key={i} className="yf-word" style={{ "--wd": `${delay}ms` }}>
                {part}
              </span>
            );
          })}
        </p>
        {senderName && <p className="yf-letter__signature">— {senderName}</p>}
        {since && (
          <div className="yf-since">
            <span className="yf-since__label">Desde el {since.label}</span>
            <span className="yf-since__value">{since.text}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function Memories({ photos, onOpen }) {
  return (
    <section className="yf-memories" aria-label="Recuerdos">
      <Reveal as="header" className="yf-section-head">
        <p className="yf-kicker">Recuerdos que florecen</p>
        <h2 className="yf-heading">Cada foto, una flor</h2>
      </Reveal>
      <ul className="yf-polaroids">
        {photos.map((photo, i) => (
          <Reveal as="li" key={photo.id || i} className="yf-polaroid-wrap" delay={(i % 3) * 90} style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` }}>
            <button type="button" className="yf-polaroid" onClick={() => onOpen(i)} aria-label={`Ver recuerdo ${i + 1} de ${photos.length}`}>
              <Photo image={photo} sizes="(min-width: 1024px) 30vw, (min-width: 700px) 44vw, 84vw" />
              <span className="yf-polaroid__petal" aria-hidden="true" />
            </button>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Videos({ videos, audio }) {
  return (
    <section className="yf-videos" aria-label="Videos">
      <Reveal as="header" className="yf-section-head">
        <p className="yf-kicker">Momentos en movimiento</p>
      </Reveal>
      <div className="yf-videos__list">
        {videos.map((video, i) => (
          <Reveal key={video.id || i} className="yf-video">
            <video
              src={video.src}
              controls
              playsInline
              preload="metadata"
              onPlay={() => audio.duck()}
              onPause={() => audio.unduck()}
              onEnded={() => audio.unduck()}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/**
 * Flores amarillas.
 * Recibe SÓLO: content (preparado por el schema), mode, audio, onEvent, env.
 */
export default function YellowFlowersExperience({ content, mode, audio, onEvent, env }) {
  const { recipientName, senderName, title, message, importantDate, photos = [], videos = [] } = content;
  const [viewer, setViewer] = useState(null);
  const since = useMemo(() => timeTogether(importantDate), [importantDate]);
  const finaleRef = useRef(null);
  const finaleVisible = useInView(finaleRef, { threshold: 0.5 });
  const low = env.tier === "low";
  const calm = env.reducedMotion || mode === "thumbnail";

  useEffect(() => {
    if (finaleVisible) onEvent?.("completed");
  }, [finaleVisible, onEvent]);

  const playableVideos = videos.filter((v) => v?.src);

  return (
    <main className="yf" data-calm={calm ? "true" : undefined} data-tier={env.tier}>
      <section className="yf-hero" aria-label="Portada">
        <Particles className="yf-hero__particles" kind="pollen" color="#ffd45e" density={low ? 0.45 : 1} max={low ? 30 : 70} active={!calm} />
        <div className="yf-hero__text">
          {recipientName && <p className="yf-eyebrow">Para {recipientName}</p>}
          <h1 className="yf-title">{title}</h1>
          {senderName && <p className="yf-from">con cariño, {senderName}</p>}
        </div>
        <Garden count={low ? 5 : 7} />
        {(message || photos.length > 0) && mode !== "thumbnail" && (
          <a className="yf-scroll" href="#yf-letter" onClick={(e) => (e.preventDefault(), document.getElementById("yf-letter")?.scrollIntoView({ behavior: calm ? "auto" : "smooth" }))}>
            <span>Desliza</span>
            <i aria-hidden="true" />
          </a>
        )}
      </section>

      {message && <Letter message={message} senderName={senderName} since={since} />}

      {photos.length > 0 && <Memories photos={photos} onOpen={setViewer} />}

      {playableVideos.length > 0 && <Videos videos={playableVideos} audio={audio} />}

      <section className="yf-finale" ref={finaleRef} aria-label="Final">
        {!low && <Particles className="yf-finale__particles" kind="petals" color="#ffcf3f" density={0.8} max={24} active={!calm && finaleVisible} />}
        <Reveal className="yf-finale__text">
          <p className="yf-kicker">{recipientName ? `Para ti, ${recipientName}` : "Para ti"}</p>
          <p className="yf-finale__line">Que nunca te falten flores</p>
          {senderName && <p className="yf-finale__signature">{senderName}</p>}
          <button type="button" className="yf-replay" onClick={() => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" })}>
            Ver de nuevo
          </button>
        </Reveal>
        <Garden variant="bouquet" />
      </section>

      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </main>
  );
}
