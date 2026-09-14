// Detección del entorno para que las plantillas adapten su intensidad.
//   tier "low"    → ahorro de datos, poca memoria o CPU: menos partículas, sin blur
//   tier "medium" → la mayoría de celulares
//   tier "high"   → escritorio / equipos potentes

function media(query) {
  return typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false;
}

export function detectEnvironment() {
  if (typeof navigator === "undefined") {
    return { tier: "medium", reducedMotion: false, isTouch: false, saveData: false };
  }
  const reducedMotion = media("(prefers-reduced-motion: reduce)");
  const isTouch = media("(pointer: coarse)");
  const saveData = Boolean(navigator.connection?.saveData);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;

  let tier = "medium";
  if (saveData || cores <= 2 || memory <= 2) tier = "low";
  else if (!isTouch && cores >= 8 && memory >= 8) tier = "high";

  return { tier, reducedMotion, isTouch, saveData };
}
