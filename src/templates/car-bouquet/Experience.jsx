import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/inter/index.css";
import "@fontsource/bangers/400.css";
import ConfettiBurst from "../../experience-kit/ConfettiBurst.jsx";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import Bouquet from "./Bouquet.jsx";
import "./styles.css";

const TILTS = [-3.2, 2.4, -1.6, 3.4, -2.6, 1.4, -3.8, 2.8, -1.2, 3, -2.2, 1.8];

/** Mensaje de un carrito. Se renderiza dentro de la plantilla para heredar sus colores. */
function CarModal({ car, index, total, onClose, onMove }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose, onMove]);

  return (
    <div className="cb-modal" role="dialog" aria-modal="true" aria-label={car.name || `Carrito ${index + 1}`}>
      <button type="button" className="cb-modal__backdrop" onClick={onClose} aria-label="Cerrar" tabIndex={-1} />
      <div className="cb-modal__card">
        <span className="cb-modal__count">
          {index + 1} / {total}
        </span>
        <button ref={closeRef} type="button" className="cb-modal__close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <div className="cb-modal__photo">
          <Photo image={car.photo} sizes="(min-width: 700px) 40vw, 62vw" fit="contain" loading="eager" />
        </div>
        {car.name && <p className="cb-modal__name">{car.name}</p>}
        <p className="cb-modal__message">{car.message}</p>
        {total > 1 && (
          <div className="cb-modal__nav">
            <button type="button" onClick={() => onMove(-1)} aria-label="Carrito anterior">
              ‹
            </button>
            <button type="button" onClick={() => onMove(1)} aria-label="Siguiente carrito">
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Letter({ message, senderName }) {
  const ref = useRef(null);
  const visible = useInView(ref, { threshold: 0.25 });
  const paragraphs = useMemo(() => message.split("\n\n"), [message]);
  let wordIndex = 0;

  return (
    <section className="cb-letter" id="cb-letter" aria-label="Carta">
      <div className="cb-letter__inner" ref={ref} data-visible={visible ? "true" : undefined}>
        <p className="cb-kicker">Lo que quería decirte</p>
        <p className="cb-letter__text">
          {paragraphs.map((paragraph, p) => (
            <span key={p} className="cb-letter__paragraph">
              {paragraph.split(/(\s+)/).map((part, i) => {
                if (/^\s+$/.test(part)) return part;
                const delay = Math.min(wordIndex++ * 45, 3200);
                return (
                  <span key={i} className="cb-word" style={{ "--wd": `${delay}ms` }}>
                    {part}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
        {senderName && <p className="cb-letter__sign">— {senderName}</p>}
      </div>
    </section>
  );
}

/**
 * Ramo de carritos. La portada oscura ("toca para abrir") es la pantalla de
 * apertura: llama a open() dentro del gesto para desbloquear la música.
 */
export default function CarBouquetExperience({ content, mode, audio, onEvent, env, opened, open }) {
  const { recipientName, senderName, title, cars = [], palette = "blue", message, photos = [], videos = [], finalLine } = content;

  const calm = env.reducedMotion || mode === "thumbnail";
  const low = env.tier === "low";
  const isOpen = opened && mode !== "thumbnail";
  const usable = cars.filter((car) => car?.photo?.src);
  const [openCar, setOpenCar] = useState(null);
  const [discovered, setDiscovered] = useState([]);
  const [viewer, setViewer] = useState(null);
  const [burst, setBurst] = useState(0);
  const finaleRef = useRef(null);
  const finaleVisible = useInView(finaleRef, { threshold: 0.5 });
  const all = usable.length > 0 && discovered.length === usable.length;

  useEffect(() => {
    if (finaleVisible) onEvent?.("completed");
  }, [finaleVisible, onEvent]);

  // Confeti la primera vez que se descubren todos los carritos.
  const celebrated = useRef(false);
  useEffect(() => {
    if (all && !celebrated.current && !calm) {
      celebrated.current = true;
      setBurst((b) => b + 1);
    }
  }, [all, calm]);

  const openCarAt = useCallback((i) => {
    setOpenCar(i);
    setDiscovered((list) => (list.includes(i) ? list : [...list, i]));
  }, []);

  const move = useCallback(
    (delta) => {
      setOpenCar((current) => {
        const next = (current + delta + usable.length) % usable.length;
        setDiscovered((list) => (list.includes(next) ? list : [...list, next]));
        return next;
      });
    },
    [usable.length]
  );

  const start = () => {
    if (isOpen || mode === "thumbnail") return;
    open();
    if (!calm) setBurst((b) => b + 1);
  };

  const playableVideos = videos.filter((v) => v?.src);

  return (
    <main className="cb" data-palette={palette} data-open={isOpen ? "true" : undefined} data-calm={calm ? "true" : undefined}>
      <div className="cb-bg" aria-hidden="true">
        <span className="cb-bg__track" />
        <span className="cb-bg__glow" />
        {!calm && !low && <Particles className="cb-bg__sparks" kind="sparkles" color="#8fd8ff" density={0.6} max={34} />}
      </div>

      {/* 1 · Portada: el ramo en la penumbra */}
      {!isOpen && mode !== "thumbnail" ? (
        <section className="cb-gate" aria-label="Abrir el ramo">
          <p className="cb-gate__title">
            <span>Toca</span>
            <span>para abrir</span>
          </p>
          <button type="button" className="cb-gate__button" data-gift-open onClick={start} aria-label="Abrir el ramo">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" />
              <path d="M26 20 46 32 26 44Z" />
            </svg>
          </button>
          <Bouquet cars={usable} dim />
          {recipientName && <p className="cb-gate__for">para {recipientName}</p>}
        </section>
      ) : (
        <>
          {/* 2 · El ramo se arma */}
          <section className="cb-hero" aria-label="El ramo">
            <header className="cb-hero__head">
              {recipientName && <p className="cb-kicker">Para {recipientName}</p>}
              <h1 className="cb-title">{title}</h1>
            </header>
            <Bouquet cars={usable} onOpen={openCarAt} discovered={discovered} growing={!calm} />
            {usable.length > 0 && (
              <p className="cb-hero__hint" role="status">
                {all ? "¡Los abriste todos! 🏁" : "Toca cada carrito para leer su mensaje"}
                <span className="cb-hero__counter">
                  {discovered.length}/{usable.length}
                </span>
              </p>
            )}
          </section>

          {/* 3 · La carta */}
          {message && <Letter message={message} senderName={senderName} />}

          {/* 4 · Álbum */}
          {photos.length > 0 && (
            <section className="cb-album" aria-label="Álbum de fotos">
              <Reveal as="header" className="cb-section-head">
                <p className="cb-kicker">El álbum</p>
                <h2 className="cb-heading">Nuestras vueltas juntos</h2>
              </Reveal>
              <ul className="cb-album__grid">
                {photos.map((photo, i) => (
                  <Reveal
                    as="li"
                    key={photo.id || i}
                    delay={(i % 3) * 90}
                    style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` }}
                  >
                    <button type="button" className="cb-polaroid" onClick={() => setViewer(i)} aria-label={`Ver foto ${i + 1}`}>
                      <Photo image={photo} sizes="(min-width: 900px) 28vw, 45vw" />
                    </button>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          {/* 5 · Videos */}
          {playableVideos.length > 0 && (
            <section className="cb-videos" aria-label="Videos">
              <Reveal as="header" className="cb-section-head">
                <p className="cb-kicker">En movimiento</p>
              </Reveal>
              <div className="cb-videos__list">
                {playableVideos.map((video, i) => (
                  <Reveal key={video.id || i} className="cb-video">
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
          )}

          {/* 6 · Meta */}
          <section className="cb-finale" ref={finaleRef} aria-label="Final">
            <Reveal className="cb-finale__inner">
              <span className="cb-flag" aria-hidden="true" />
              <p className="cb-finale__line">{finalLine}</p>
              {senderName && <p className="cb-finale__sign">{senderName}</p>}
              <button
                type="button"
                className="cb-replay"
                onClick={() => window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" })}
              >
                Ver de nuevo
              </button>
            </Reveal>
          </section>
        </>
      )}

      {openCar !== null && usable[openCar] && (
        <CarModal
          car={usable[openCar]}
          index={openCar}
          total={usable.length}
          onClose={() => setOpenCar(null)}
          onMove={move}
        />
      )}

      <PhotoViewer photos={photos} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
      <ConfettiBurst trigger={burst} colors={["#35c8ff", "#ff3d5a", "#ffd23f", "#9bff6a", "#ffffff"]} />
    </main>
  );
}
