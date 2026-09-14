import { useEffect, useMemo } from "react";
import { prepareContent } from "../../gift-core/index.js";
import { getTemplate, preloadExperience } from "./registry.js";
import ExperienceShell from "./ExperienceShell.jsx";
import { ShellMessage } from "./ShellStatus.jsx";

/**
 * Lee templateId → busca en el registro → prepara el contenido con el schema
 * → renderiza la experiencia dentro del ExperienceShell.
 *
 * @param {{ gift: { templateId: string, recipientName?: string, senderName?: string, content?: object },
 *           media?: Record<string, object>, mode?: "live"|"preview"|"demo"|"thumbnail",
 *           onEvent?: (type: string) => void, onRespond?: (type: string, payload: object) => Promise<object>,
 *           autoOpen?: boolean }} props
 */
export default function TemplateRenderer({ gift, media = {}, mode = "live", onEvent, onRespond, autoOpen }) {
  const template = getTemplate(gift?.templateId);

  const content = useMemo(
    () => (template ? prepareContent(template.schema, gift, media) : null),
    [template, gift, media]
  );

  useEffect(() => {
    if (template) preloadExperience(template.manifest.id);
  }, [template]);

  if (!template) {
    return <ShellMessage title="Esta experiencia no está disponible" text="Pídele a quien te la envió que la revise." />;
  }

  return (
    <ExperienceShell
      key={template.manifest.id}
      manifest={template.manifest}
      schema={template.schema}
      content={content}
      media={media}
      mode={mode}
      onEvent={onEvent}
      onRespond={onRespond}
      autoOpen={autoOpen}
      Experience={template.Experience}
    />
  );
}
