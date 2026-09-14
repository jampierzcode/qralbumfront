import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import "@fontsource-variable/cormorant-garamond/index.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource/caveat/500.css";
import Particles from "../../experience-kit/Particles.jsx";
import Photo from "../../experience-kit/Photo.jsx";
import PhotoViewer from "../../experience-kit/PhotoViewer.jsx";
import { useInView } from "../../experience-kit/Reveal.jsx";
import "./styles.css";

const EASE = [0.22, 0.8, 0.24, 1];
const OPENING_MS = 2900;
const TILTS = [-6, 4, -3, 7, -5, 3, -7, 5];
const dateFmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function formatLetterDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
}

function splitSentences(paragraph) {
  return paragraph.split(/(?<=[.!?…])\s+/).filter(Boolean);
}

function Envelope({ stage, sealColor, initial, onOpen, interactive }) {
  const opening = stage === "opening";
  return (
    <motion.button
      type="button"
      className={`ll-envelope ll-seal--${sealColor}`}
      data-gift-open
      onClick={onOpen}
      disabled={!interactive}
      aria-label="Abrir el sobre"
      whileHover={interactive ? { y: -6, rotate: -0.6 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      animate={opening ? { y: [0, -4, 0] } : { y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="ll-envelope__back" />
      <motion.span
        className="ll-envelope__letter"
        initial={false}
        animate={opening ? { y: "-72%" } : { y: "0%" }}
        transition={{ delay: 1.0, duration: 1.1, ease: EASE }}
      >
        <i />
        <i />
        <i />
      </motion.span>
      <span className="ll-envelope__front" />
      <motion.span
        className="ll-envelope__flap"
        style={{ transformPerspective: 900 }}
        initial={false}
        animate={opening ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 4 }}
        transition={{ delay: 0.35, duration: 0.85, ease: EASE, zIndex: { delay: 0.8 } }}
      />
      <motion.span
        className="ll-seal"
        initial={false}
        animate={opening ? { scale: [1, 1.18, 0.4], opacity: [1, 1, 0], rotate: [0, -8, 14] } : { scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        {initial}
      </motion.span>
    </motion.button>
  );
}

function Paragraph({ text, calm, first }) {
  const ref = useRef(null);
  const visible = useInView(ref, { threshold: 0.3 });
  const sentences = useMemo(() => splitSentences(text), [text]);
  return (
    <motion.p
      ref={ref}
      className="ll-paragraph"
      initial={calm ? false : "hidden"}
      animate={calm || visible ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.42, delayChildren: first ? 0.6 : 0.1 } } }}
    >
      {sentences.map((sentence, i) => (
        <motion.span
          key={i}
          className="ll-sentence"
          variants={{
            hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } },
          }}
        >
          {sentence}{" "}
        </motion.span>
      ))}
    </motion.p>
  );
}

/**
 * Carta de amor. El sobre es la pantalla de apertura (manifest.gate = "template"):
 * al tocarlo se llama a open(), que desbloquea la música en el mismo gesto.
 */
export default function LoveLetterExperience({ content, mode, onEvent, env, opened, open }) {
  const { recipientName, senderName, teaser, letter, closing, letterDate, memories = [], finalMessage, sealColor = "wine" } = content;
  const calm = env.reducedMotion;
  const thumbnail = mode === "thumbnail";
  const [stage, setStage] = useState(!thumbnail && opened ? "reading" : "closed");
  const [viewer, setViewer] = useState(null);
  const finalRef = useRef(null);
  const finalVisible = useInView(finalRef, { threshold: 0.5 });

  const paragraphs = useMemo(() => (letter || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean), [letter]);
  const initial = (senderName || recipientName || "♥").trim().charAt(0).toUpperCase();

  // El preview del editor puede abrir directamente la carta.
  useEffect(() => {
    if (opened && !thumbnail && stage === "closed") setStage("reading");
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stage !== "opening") return;
    const t = setTimeout(() => setStage("reading"), OPENING_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (finalVisible) onEvent?.("completed");
  }, [finalVisible, onEvent]);

  const handleOpen = () => {
    if (stage !== "closed" || thumbnail) return;
    open(); // síncrono dentro del gesto: desbloquea el audio
    setStage(calm ? "reading" : "opening");
  };

  const reseal = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setStage("closed");
  };

  return (
    <div className="ll" data-stage={stage} data-calm={calm ? "true" : undefined}>
      <AnimatePresence mode="wait">
        {stage !== "reading" ? (
          <motion.section
            key="closed"
            className="ll-stage"
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.5, ease: EASE } }}
            aria-label="Sobre cerrado"
          >
            {!thumbnail && <Particles className="ll-sky" kind="sparkles" color="#f1d9b5" density={env.tier === "low" ? 0.5 : 1} max={env.tier === "low" ? 40 : 90} active={!calm} />}
            <motion.div
              className="ll-stage__text"
              initial={thumbnail ? false : { opacity: 0, y: 16 }}
              animate={stage === "opening" ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: stage === "opening" ? 0 : 0.2 }}
            >
              {recipientName && <p className="ll-eyebrow">Para {recipientName}</p>}
              <h1 className="ll-teaser">{teaser}</h1>
            </motion.div>

            <motion.div
              className="ll-envelope-wrap"
              initial={thumbnail ? false : { opacity: 0, y: 40, rotate: -3 }}
              animate={stage === "opening" ? { opacity: [1, 1, 0], y: [0, 0, 60] } : { opacity: 1, y: 0, rotate: 0 }}
              transition={
                stage === "opening"
                  ? { duration: OPENING_MS / 1000, times: [0, 0.78, 1], ease: "easeInOut" }
                  : { duration: 1, ease: EASE, delay: 0.35 }
              }
            >
              <Envelope stage={stage} sealColor={sealColor} initial={initial} onOpen={handleOpen} interactive={stage === "closed" && !thumbnail} />
            </motion.div>

            {stage === "closed" && !thumbnail && (
              <motion.p className="ll-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                Toca el sobre para abrirlo
              </motion.p>
            )}
          </motion.section>
        ) : (
          <motion.main key="reading" className="ll-read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <section className="ll-desk" aria-label="Carta">
              <motion.article
                className="ll-paper"
                initial={calm ? false : { y: 60, opacity: 0, rotate: 1.5 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                {letterDate && <p className="ll-date">{formatLetterDate(letterDate)}</p>}
                <p className="ll-greeting">{recipientName ? `Querida ${recipientName},` : "Para ti,"}</p>
                {paragraphs.map((p, i) => (
                  <Paragraph key={i} text={p} calm={calm} first={i === 0} />
                ))}
                <div className="ll-signoff">
                  {closing && <p className="ll-closing">{closing},</p>}
                  {senderName && <p className="ll-signature">{senderName}</p>}
                </div>
              </motion.article>
            </section>

            {memories.length > 0 && (
              <section className="ll-memories" aria-label="Recuerdos">
                <p className="ll-eyebrow ll-eyebrow--center">Nuestros recuerdos</p>
                <ul className="ll-table">
                  {memories.map((photo, i) => (
                    <motion.li
                      key={photo.id || i}
                      className="ll-memory"
                      style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` }}
                      initial={calm ? false : { opacity: 0, y: -140, rotate: TILTS[i % TILTS.length] * 3, scale: 1.1 }}
                      whileInView={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length], scale: 1 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ type: "spring", stiffness: 70, damping: 14, delay: (i % 4) * 0.12 }}
                    >
                      <button type="button" className="ll-memory__button" onClick={() => setViewer(i)} aria-label={`Ver recuerdo ${i + 1} de ${memories.length}`}>
                        <Photo image={photo} sizes="(min-width: 1024px) 24vw, (min-width: 700px) 30vw, 46vw" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </section>
            )}

            <section className="ll-final" ref={finalRef} aria-label="Final">
              <Particles className="ll-hearts" kind="hearts" color="#d9607f" density={0.9} max={env.tier === "low" ? 12 : 26} active={!calm && finalVisible} />
              <motion.div
                className="ll-final__inner"
                initial={calm ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: EASE }}
              >
                <span className={`ll-seal ll-seal--static ll-seal--${sealColor}`} aria-hidden="true">
                  ♥
                </span>
                {finalMessage && <p className="ll-final__message">{finalMessage}</p>}
                {senderName && <p className="ll-final__from">— {senderName}</p>}
                <button type="button" className="ll-again" onClick={reseal}>
                  Volver a abrir el sobre
                </button>
              </motion.div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>

      <PhotoViewer photos={memories} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} />
    </div>
  );
}
