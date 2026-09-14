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
    document.title = name ? `Un regalo para ${name}` : templateName || "Tienes un regalo";
  }, [state]);

  const onEvent = useCallback((type) => sendGiftEvent(slug, type), [slug]);

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

  return <TemplateRenderer gift={state.gift} media={state.media} mode="live" onEvent={onEvent} />;
}
