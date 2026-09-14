import { useMemo } from "react";
import { getSteps } from "../../gift-core/index.js";
import { FieldControl } from "./fields.jsx";
import "./editor.css";

/** errors [{path, message}] → { path: message } (primer mensaje por ruta) */
export function errorsByPath(errors = []) {
  const map = {};
  for (const { path, message } of errors) if (!map[path]) map[path] = message;
  return map;
}

/**
 * Editor generado AUTOMÁTICAMENTE desde el schema de una plantilla.
 * Lo usan el editor del admin, el wizard de creación y el portal del comprador.
 *
 * @param {object}   props
 * @param {object}   props.schema
 * @param {object}   props.values        content + recipientName/senderName
 * @param {(key:string, value:any) => void} props.onChange
 * @param {Array<{path,message}>} [props.errors]
 * @param {string[]} [props.stepIds]     renderizar sólo estos pasos (wizard)
 * @param {string[]} [props.keys]        limitar a estas claves (portal)
 * @param {"admin"|"customer"} [props.audience]
 * @param {{ assets: Record<string, object>, upload: Function, remove?: Function }} props.media
 * @param {boolean}  [props.showStepTitles]
 */
export default function SchemaForm({
  schema,
  values,
  onChange,
  errors = [],
  stepIds,
  keys,
  audience = "admin",
  media,
  disabled = false,
  showStepTitles = true,
  className = "",
}) {
  const steps = useMemo(() => {
    const all = getSteps(schema, { keys });
    return stepIds ? all.filter((s) => stepIds.includes(s.id)) : all;
  }, [schema, keys, stepIds]);
  const errorMap = useMemo(() => errorsByPath(errors), [errors]);

  return (
    <div className={`sf ${className}`}>
      {steps.map((step) => (
        <section key={step.id} className="sf-step" aria-labelledby={`sf-step-${step.id}`}>
          {showStepTitles && (
            <header className="sf-step__header">
              <h3 id={`sf-step-${step.id}`} className="sf-step__title">
                {(audience === "customer" && step.portalTitle) || step.title}
              </h3>
              {step.description && <p className="sf-description">{step.description}</p>}
            </header>
          )}
          <div className="sf-step__fields">
            {step.fields.map(([key, field]) => (
              <FieldControl
                key={key}
                field={field}
                name={key}
                path={key}
                value={values?.[key]}
                onChange={(next) => onChange(key, next)}
                errors={errorMap}
                audience={audience}
                media={media}
                disabled={disabled}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
