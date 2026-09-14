import { useAudioState } from "../engine/useAudio.js";
import "./music-toggle.css";

/** Botón flotante de música. Infraestructura transversal: lo usa el ExperienceShell. */
export default function MusicToggle({ audio, className = "" }) {
  const { available, playing } = useAudioState(audio);
  if (!available) return null;

  return (
    <button
      type="button"
      className={`xk-music ${playing ? "is-playing" : ""} ${className}`}
      onClick={() => audio.toggle()}
      aria-label={playing ? "Pausar música" : "Reproducir música"}
      aria-pressed={playing}
    >
      <span className="xk-music__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      {!playing && <span className="xk-music__label">Música</span>}
    </button>
  );
}
