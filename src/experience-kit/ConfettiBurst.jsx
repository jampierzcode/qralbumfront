import { useEffect, useRef } from "react";

/**
 * Ráfaga única de confeti en canvas (no crea nodos DOM).
 * Cada vez que cambia `trigger` (número > 0) dispara una ráfaga.
 * No hace nada con prefers-reduced-motion.
 */
export default function ConfettiBurst({ trigger, colors = ["#f7c948", "#ef5a8a", "#6ec6ff", "#9b7bff", "#ffffff"], count = 140, origin = { x: 0.5, y: 0.35 } }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces = Array.from({ length: Math.min(count, width < 500 ? 90 : count) }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 9;
      return {
        x: width * origin.x,
        y: height * origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    let raf = 0;
    const start = performance.now();
    const frame = (time) => {
      const t = (time - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      for (const p of pieces) {
        p.vy += 0.28;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.spin;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 2) / 1.2);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        ctx.restore();
      }
      if (t < 3.3) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, width, height);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 60 }} />;
}
