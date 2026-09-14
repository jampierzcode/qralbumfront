import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import TemplateRenderer from "../engine/TemplateRenderer.jsx";
import { ShellMessage } from "../engine/ShellStatus.jsx";
import { getTemplate } from "../engine/registry.js";

/** /demo/:templateId — la plantilla con su contenido de ejemplo. Útil para mostrar en Lives. */
export default function DemoPage() {
  const { templateId } = useParams();
  const template = getTemplate(templateId);
  const gift = useMemo(() => (template ? { templateId, ...template.demo.gift } : null), [template, templateId]);

  useEffect(() => {
    if (template) document.title = `${template.manifest.name} · Demo`;
  }, [template]);

  if (!template) return <ShellMessage title="Esta plantilla no existe" />;
  return <TemplateRenderer gift={gift} media={template.demo.media} mode="demo" />;
}
