import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAudioController } from "./useAudio.js";
import { detectEnvironment } from "./environment.js";
import MusicToggle from "../experience-kit/MusicToggle.jsx";
import { ShellLoading, ShellMessage } from "./ShellStatus.jsx";
import "./shell.css";

class ExperienceErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error) {
    console.error("Error en la experiencia:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <ShellMessage
          title="Algo no salió como esperábamos"
          text="Recarga la página para volver a intentarlo."
          action={{ label: "Recargar", onClick: () => window.location.reload() }}
        />
      );
    }
    return this.props.children;
  }
}

function interpolate(text, content) {
  if (!text) return "";
  return text.replace(/\{(\w+)\}/g, (_, key) => content[key] || "");
}

function soundtrackKey(manifest, schema) {
  if (manifest.soundtrack) return manifest.soundtrack;
  return Object.entries(schema.fields).find(([, field]) => field.type === "audio")?.[0] || null;
}

function Gate({ manifest, content, onOpen }) {
  const copy = manifest.gateCopy || {};
  const hasName = /\{recipientName\}/.test(copy.title || "") && content.recipientName;
  const title = hasName ? interpolate(copy.title, content) : copy.fallbackTitle || interpolate(copy.title, content) || "Tienes un regalo";

  return (
    <div className="gs-gate" role="dialog" aria-label="Abrir regalo">
      <div className="gs-gate__glow" aria-hidden="true" />
      <div className="gs-gate__content">
        {copy.eyebrow && <p className="gs-gate__eyebrow">{interpolate(copy.eyebrow, content)}</p>}
        <h1 className="gs-gate__title">{title}</h1>
        {content.senderName && <p className="gs-gate__from">De parte de {content.senderName}</p>}
        <button type="button" className="gs-gate__button" onClick={onOpen}>
          {copy.button || "Toca para abrir"}
        </button>
        {manifest.supportsMusic && <p className="gs-gate__hint">Sube el volumen 🔊</p>}
      </div>
    </div>
  );
}

/**
 * Envoltorio común de TODA experiencia pública.
 * Responsabilidades: carga/errores, "toca para abrir" (desbloquea audio), música,
 * pausa al ocultar la pestaña, reduced motion, safe-area, 100dvh, tier de
 * rendimiento, eventos básicos y pantalla completa opcional.
 */
export default function ExperienceShell({ manifest, schema, content, media, mode = "live", onEvent, Experience, autoOpen = false }) {
  const env = useMemo(detectEnvironment, []);
  const isThumbnail = mode === "thumbnail";
  const track = content[soundtrackKey(manifest, schema)] || null;
  const audio = useAudioController(track?.src ? track : null, { enabled: !isThumbnail });

  const [opened, setOpened] = useState(autoOpen || isThumbnail);
  const openedRef = useRef(opened);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const emit = useCallback((type, meta) => {
    onEventRef.current?.(type, meta);
  }, []);

  // Debe ejecutarse de forma síncrona dentro del gesto del usuario.
  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    audio.unlock();
    if (manifest.preferFullscreen && env.isTouch && mode === "live" && document.fullscreenEnabled) {
      document.documentElement.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {});
    }
    setOpened(true);
    emit("opened");
  }, [audio, emit, env.isTouch, manifest.preferFullscreen, mode]);

  // Pausa la música cuando la pestaña se oculta y la retoma al volver.
  useEffect(() => {
    const onVisibility = () => (document.hidden ? audio.suspend() : audio.resume());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [audio]);

  const theme = manifest.theme || {};
  const style = {
    "--gift-bg": theme.background || "#0b0b0f",
    "--gift-fg": theme.foreground || "#f6f3ee",
    "--gift-accent": theme.accent || "#f5c451",
  };
  const templateGate = manifest.gate === "template";
  const showExperience = templateGate || opened;

  return (
    <div
      className="gs-root"
      style={style}
      data-mode={mode}
      data-tier={env.tier}
      data-reduced-motion={env.reducedMotion ? "true" : undefined}
    >
      <ExperienceErrorBoundary>
        <Suspense fallback={<ShellLoading />}>
          {showExperience && (
            <Experience
              content={content}
              media={media}
              mode={mode}
              audio={audio}
              onEvent={emit}
              env={env}
              opened={opened}
              open={open}
            />
          )}
        </Suspense>
      </ExperienceErrorBoundary>

      {!templateGate && !opened && <Gate manifest={manifest} content={content} onOpen={open} />}
      {opened && !isThumbnail && <MusicToggle audio={audio} />}
    </div>
  );
}
