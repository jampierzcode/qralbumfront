import { useEffect, useRef, useState } from "react";
import TemplateRenderer from "../engine/TemplateRenderer.jsx";
import { ShellLoading } from "../engine/ShellStatus.jsx";

/**
 * /frame — destino del iframe de preview del editor.
 * Recibe el regalo por postMessage (mismo origen) para que la plantilla se renderice
 * con el viewport REAL del marco (390px, 768px…) y sus media queries funcionen.
 *
 * Mensajes: { type: "gift-preview:update", gift, media, autoOpen } · { type: "gift-preview:restart" }
 */
export default function FramePage() {
  const [payload, setPayload] = useState(null);
  const [run, setRun] = useState(0);
  const templateIdRef = useRef(null);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin || !event.data?.type) return;
      if (event.data.type === "gift-preview:update") {
        const { gift, media, autoOpen } = event.data;
        if (templateIdRef.current && templateIdRef.current !== gift?.templateId) setRun((r) => r + 1);
        templateIdRef.current = gift?.templateId;
        setPayload({ gift, media: media || {}, autoOpen: Boolean(autoOpen) });
      }
      if (event.data.type === "gift-preview:restart") setRun((r) => r + 1);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "gift-preview:ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!payload) return <ShellLoading label="Cargando vista previa…" />;
  return (
    <TemplateRenderer
      key={run}
      gift={payload.gift}
      media={payload.media}
      mode="preview"
      autoOpen={payload.autoOpen}
    />
  );
}
