import { useEffect, useState, useSyncExternalStore } from "react";
import { createAudioController } from "./audio.js";

/** Crea un controlador de audio ligado al ciclo de vida del componente. */
export function useAudioController(track, { enabled = true } = {}) {
  const [controller] = useState(createAudioController);

  useEffect(() => {
    controller.setTrack(enabled ? track : null);
  }, [controller, enabled, track?.src]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => controller.destroy(), [controller]);

  return controller;
}

/** Estado reactivo { available, playing, blocked, ready } de un controlador. */
export function useAudioState(controller) {
  return useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
}
