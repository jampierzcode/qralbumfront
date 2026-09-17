import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TemplateRenderer from "../engine/TemplateRenderer.jsx";
import { ShellLoading, ShellMessage } from "../engine/ShellStatus.jsx";
import { getTemplate } from "../engine/registry.js";
import { publicRequest, sendGiftEvent } from "../lib/publicApi.js";

/** /g/:slug — única ruta pública de regalos. */
export default function GiftPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: "loading" });

  const load = useCallback(
    (signal) => {
      setState({ status: "loading" });
      publicRequest(`/public/gifts/${encodeURIComponent(slug)}`, { signal })
        .then((data) => setState({ status: "ready", ...data }))
        .catch((error) => {
          if (error.name !== "AbortError") setState({ status: "error", error });
        });
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (state.status !== "ready") return;
    const name = state.gift.recipientName;
    const templateName = getTemplate(state.gift.templateId)?.manifest.name;
    const headline = name ? `Un regalo para ${name}` : templateName || "Tienes un regalo";
    document.title = `${headline} · MiAlbumQr`;
  }, [state]);

  // Cada tipo de evento se registra una vez por sesión del navegador (recargar no duplica aperturas).
  const onEvent = useCallback(
    (type) => {
      if (!["opened", "completed", "music_started"].includes(type)) return;
      const key = `gift-event:${slug}:${type}`;
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        /* modo privado: se envía igual */
      }
      sendGiftEvent(slug, type);
    },
    [slug]
  );

  const onRespond = useCallback(
    (type, payload) => publicRequest(`/public/gifts/${encodeURIComponent(slug)}/responses`, { method: "POST", body: { type, ...payload } }),
    [slug]
  );

  if (state.status === "loading") return <ShellLoading />;
  if (state.status === "error") {
    if (state.error.status === 404) {
      return <ShellMessage title="Este regalo no está disponible" text="Puede que el enlace esté incompleto o que aún lo estén preparando." />;
    }
    return (
      <ShellMessage
        title="No pudimos abrir el regalo"
        text={state.error.message}
        action={{ label: "Intentar de nuevo", onClick: () => load() }}
      />
    );
  }

  return <TemplateRenderer gift={state.gift} media={state.media} mode="live" onEvent={onEvent} onRespond={onRespond} />;
}
