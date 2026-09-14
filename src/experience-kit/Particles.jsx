import { useEffect, useRef } from "react";

// Partículas en canvas con TOPE de cantidad (nada de crear nodos DOM sin límite).
// Se pausan fuera de pantalla, con la pestaña oculta y con prefers-reduced-motion.

const KINDS = {
  pollen: { rise: true, speed: [8, 22], size: [1.2, 3.2], drift: 14, spin: false, alpha: [0.35, 0.9], perArea: 1 / 14000 },
  petals: { rise: false, speed: [24, 55], size: [6, 12], drift: 38, spin: true, alpha: [0.6, 0.95], perArea: 1 / 42000 },
  hearts: { rise: true, speed: [14, 30], size: [6, 12], drift: 18, spin: false, alpha: [0.25, 0.7], perArea: 1 / 38000 },
  sparkles: { rise: false, speed: [0, 4], size: [1, 2.6], drift: 2, spin: false, alpha: [0.1, 0.9], twinkle: true, perArea: 1 / 9000 },
  confetti: { rise: false, speed: [30, 70], size: [5, 9], drift: 30, spin: true, alpha: [0.75, 1], perArea: 1 / 26000 },
};

const rand = (min, max) => min + Math.random() * (max - min);

function makeSprite(kind, color) {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  if (kind === "pollen" || kind === "sparkles") {
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, color);
    g.addColorStop(0.25, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else if (kind === "petals") {
    const g = ctx.createLinearGradient(0, 8, 0, size - 8);
    g.addColorStop(0, color);
    g.addColorStop(1, "#e08a12");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(c, c, size * 0.2, size * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "confetti") {
    ctx.fillStyle = color;
    ctx.fillRect(c - size * 0.18, c - size * 0.36, size * 0.36, size * 0.72);
  } else if (kind === "hearts") {
    ctx.fillStyle = color;
    ctx.translate(c, c + 4);
    ctx.scale(2.2, 2.2);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-10, -2, -6, -12, 0, -6);
    ctx.bezierCurveTo(6, -12, 10, -2, 0, 6);
    ctx.fill();
  }
  return canvas;
}

/**
 * @param {{ kind?: "pollen"|"petals"|"hearts"|"sparkles"|"confetti", color?: string, colors?: string[], density?: number, max?: number, className?: string, active?: boolean }} props
 */
export default function Particles({ kind = "pollen", color = "#ffd76a", colors, density = 1, max = 90, className = "", active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const cfg = KINDS[kind] || KINDS.pollen;
    const ctx = canvas.getContext("2d");
    const sprites = (colors?.length ? colors : [color]).map((c) => makeSprite(kind, c));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;
    let last = 0;
    let visible = true;

    const spawn = (anywhere) => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : cfg.rise ? height + 10 : -10,
      size: rand(...cfg.size),
      speed: rand(...cfg.speed),
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      spin: cfg.spin ? rand(-1.2, 1.2) : 0,
      alpha: rand(...cfg.alpha),
      sprite: sprites[Math.floor(Math.random() * sprites.length)],
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(max, Math.max(6, Math.round(width * height * cfg.perArea * density)));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const frame = (time) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (time - (last || time)) / 1000);
      last = time;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.phase += dt;
        p.y += (cfg.rise ? -1 : 1) * p.speed * dt;
        p.x += Math.sin(p.phase * 0.8) * cfg.drift * dt;
        p.rot += p.spin * dt;
        if (cfg.rise ? p.y < -20 : p.y > height + 20) Object.assign(p, spawn(false));
        const alpha = cfg.twinkle ? p.alpha * (0.5 + 0.5 * Math.sin(p.phase * 2.2)) : p.alpha;
        ctx.globalAlpha = alpha;
        const s = p.size * (kind === "pollen" || kind === "sparkles" ? 4 : 1.6);
        if (p.spin) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.drawImage(p.sprite, -s / 2, -s / 2, s, s);
          ctx.restore();
        } else {
          ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    intersection.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, color, colors?.join(","), density, max, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} className={className} aria-hidden="true" style={{ display: "block", pointerEvents: "none" }} />;
}
