// Controlador de música de la experiencia.
// Regla: NUNCA intenta autoplay. `unlock()` debe llamarse dentro de un gesto
// del usuario (el "toca para abrir"): así iOS Safari, Chrome Android y los
// navegadores internos de TikTok/Instagram permiten reproducir con sonido.

const INITIAL = Object.freeze({ available: false, playing: false, blocked: false, ready: false });

export function createAudioController() {
  let element = null;
  let track = null;
  let state = INITIAL;
  let unlocked = false;
  let resumeOnVisible = false;
  let resumeAfterDuck = false;
  const listeners = new Set();

  const set = (patch) => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  };

  function ensureElement() {
    if (element || typeof Audio === "undefined") return element;
    element = new Audio();
    element.loop = true;
    element.preload = "auto";
    element.setAttribute("playsinline", "");
    element.addEventListener("playing", () => set({ playing: true, blocked: false }));
    element.addEventListener("pause", () => set({ playing: false }));
    element.addEventListener("canplay", () => set({ ready: true }));
    element.addEventListener("loadedmetadata", () => {
      if (track?.startAt && element.currentTime < track.startAt) element.currentTime = track.startAt;
    });
    if (track) element.src = track.src;
    return element;
  }

  function tryPlay() {
    const el = ensureElement();
    if (!el || !track) return;
    const result = el.play();
    if (result?.catch) result.catch(() => set({ playing: false, blocked: true }));
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** Cambia la pista (ej. el admin reemplaza la canción en el preview). */
    setTrack(next) {
      const src = next?.src || null;
      if ((track?.src || null) === src) return;
      track = src ? { src, startAt: next.startAt || 0 } : null;
      set({ available: Boolean(track), ready: false });
      if (!element) return;
      const wasPlaying = !element.paused;
      element.pause();
      if (track) {
        element.src = track.src;
        if (wasPlaying && unlocked) tryPlay();
      } else {
        element.removeAttribute("src");
        element.load();
      }
    },

    /** Llamar SIEMPRE de forma síncrona dentro del gesto del usuario. */
    unlock() {
      unlocked = true;
      tryPlay();
    },

    play: tryPlay,

    /** Posición actual para reproductores propios de una plantilla (leer con requestAnimationFrame). */
    getPosition() {
      return {
        current: element?.currentTime || 0,
        duration: element && Number.isFinite(element.duration) ? element.duration : 0,
      };
    },
    seek(seconds) {
      const el = ensureElement();
      if (!el || !Number.isFinite(seconds)) return;
      const duration = Number.isFinite(el.duration) ? el.duration : Infinity;
      el.currentTime = Math.max(0, Math.min(seconds, duration));
    },
    pause() {
      element?.pause();
    },
    toggle() {
      if (state.playing) element?.pause();
      else tryPlay();
    },

    /** Pausa temporal mientras suena un video de la experiencia. */
    duck() {
      resumeAfterDuck = state.playing;
      element?.pause();
    },
    unduck() {
      if (resumeAfterDuck) tryPlay();
      resumeAfterDuck = false;
    },

    /** Pestaña oculta / visible. */
    suspend() {
      resumeOnVisible = state.playing;
      element?.pause();
    },
    resume() {
      if (resumeOnVisible && unlocked) tryPlay();
      resumeOnVisible = false;
    },

    destroy() {
      listeners.clear();
      if (element) {
        element.pause();
        element.removeAttribute("src");
        element.load();
        element = null;
      }
    },
  };
}
