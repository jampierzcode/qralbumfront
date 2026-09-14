import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Photo from "./Photo.jsx";
import "./photo-viewer.css";

/**
 * Visor de fotos a pantalla completa.
 * Touch: deslizar · Mouse: flechas en pantalla · Teclado: ← → y Esc.
 */
export default function PhotoViewer({ photos, index, onIndexChange, onClose, caption }) {
  const start = useRef(null);
  const closeButton = useRef(null);
  const open = index !== null && index >= 0 && photos[index];

  const go = useCallback(
    (delta) => onIndexChange((index + delta + photos.length) % photos.length),
    [index, photos.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [open, go, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="xk-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} de ${photos.length}`}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        start.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90) onClose();
      }}
    >
      <div className="xk-viewer__stage" key={index}>
        <Photo image={photos[index]} sizes="100vw" loading="eager" fit="contain" className="xk-viewer__photo" />
      </div>
      {caption && <p className="xk-viewer__caption">{caption}</p>}
      <div className="xk-viewer__bar">
        <span className="xk-viewer__count">
          {index + 1} / {photos.length}
        </span>
        <button ref={closeButton} type="button" className="xk-viewer__btn" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
      </div>
      {photos.length > 1 && (
        <>
          <button type="button" className="xk-viewer__nav xk-viewer__nav--prev" onClick={() => go(-1)} aria-label="Foto anterior">
            ‹
          </button>
          <button type="button" className="xk-viewer__nav xk-viewer__nav--next" onClick={() => go(1)} aria-label="Foto siguiente">
            ›
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
