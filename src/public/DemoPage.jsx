import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import TemplateRenderer from "../engine/TemplateRenderer.jsx";
import { ShellMessage } from "../engine/ShellStatus.jsx";
import { getTemplate } from "../engine/registry.js";

/**
 * /demo/:templateId — la plantilla con su contenido de ejemplo. Útil para mostrar en Lives.
 * ?preview=1 → modo miniatura (abre sola, sin sonido): lo usan las tarjetas animadas del admin.
 */
export default function DemoPage() {
  const { templateId } = useParams();
  const [params] = useSearchParams();
  const thumbnail = params.get("preview") === "1";
  const template = getTemplate(templateId);
  const gift = useMemo(() => (template ? { templateId, ...template.demo.gift } : null), [template, templateId]);

  useEffect(() => {
    if (template) document.title = `${template.manifest.name} · Demo · MiAlbumQr`;
  }, [template]);

  if (!template) return <ShellMessage title="Esta plantilla no existe" />;
  return <TemplateRenderer gift={gift} media={template.demo.media} mode={thumbnail ? "thumbnail" : "demo"} />;
}
