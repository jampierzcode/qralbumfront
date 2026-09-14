import { useEffect, useRef, useState } from "react";
import "./reveal.css";

/** true cuando el elemento entra en pantalla (una sola vez por defecto). */
export function useInView(ref, { threshold = 0.18, rootMargin = "0px 0px -8% 0px", once = true } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once]);
  return inView;
}

/**
 * Aparece al entrar en pantalla (opacidad + desplazamiento suave).
 * Respeta prefers-reduced-motion. Variantes: "up" | "fade" | "scale".
 */
export default function Reveal({ as: Tag = "div", variant = "up", delay = 0, className = "", style, children, ...rest }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <Tag
      ref={ref}
      className={`xk-reveal xk-reveal--${variant} ${className}`}
      data-visible={visible ? "true" : undefined}
      style={{ "--xk-delay": `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
