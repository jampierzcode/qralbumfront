import { useEffect, useState } from "react";

const UNITS = [
  ["days", "Días", 86400],
  ["hours", "Horas", 3600],
  ["minutes", "Min", 60],
  ["seconds", "Seg", 1],
];

/** Tiempo restante hasta `target` (Date o ISO). Se actualiza cada segundo. */
export function useCountdown(target) {
  const time = target ? new Date(target).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!Number.isFinite(time)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [time]);

  if (!Number.isFinite(time)) return null;
  let left = Math.max(0, Math.floor((time - now) / 1000));
  const parts = {};
  for (const [key, , size] of UNITS) {
    parts[key] = Math.floor(left / size);
    left -= parts[key] * size;
  }
  return { ...parts, done: time <= now };
}

/**
 * Cuenta regresiva en fichas. Estilo 100% del lado de la plantilla
 * (clases: xk-countdown, xk-countdown__unit, __value, __label).
 */
export default function Countdown({ target, className = "", doneLabel = "¡Llegó el día!" }) {
  const left = useCountdown(target);
  if (!left) return null;
  if (left.done) return <p className={`xk-countdown xk-countdown--done ${className}`}>{doneLabel}</p>;
  return (
    <div className={`xk-countdown ${className}`} role="timer" aria-label={`Faltan ${left.days} días, ${left.hours} horas y ${left.minutes} minutos`}>
      {UNITS.map(([key, label]) => (
        <div key={key} className={`xk-countdown__unit xk-countdown__unit--${key}`}>
          <span className="xk-countdown__value">{String(left[key]).padStart(2, "0")}</span>
          <span className="xk-countdown__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
