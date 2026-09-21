import { useId, useLayoutEffect, useRef } from "react";
import { getItemDefaults } from "../../gift-core/index.js";
import ImagesField from "./media/ImagesField.jsx";
import MediaField from "./media/MediaField.jsx";

const LENGTH_TYPES = new Set(["text", "textarea"]);

function labelFor(field, audience) {
  return (audience === "customer" && field.portalLabel) || field.label;
}

function descriptionFor(field, audience) {
  return (audience === "customer" && field.portalDescription) || field.description;
}

function AutoTextarea({ value, onChange, rows, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return <textarea ref={ref} rows={rows} value={value} onChange={onChange} {...props} />;
}

function ScalarInput({ field, value, onChange, id, invalid, describedBy, disabled }) {
  const common = {
    id,
    disabled,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
    className: "sf-input",
  };
  switch (field.type) {
    case "text":
      return (
        <input
          {...common}
          type="text"
          value={value ?? ""}
          placeholder={field.placeholder}
          maxLength={field.max ? field.max + 20 : undefined}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      );
    case "textarea":
      return (
        <AutoTextarea
          {...common}
          className="sf-input sf-textarea"
          rows={field.rows || 4}
          value={value ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return <input {...common} type="date" value={value ?? ""} min={field.min} max={field.max} onChange={(e) => onChange(e.target.value || null)} />;
    case "number": {
      if (field.slider) {
        // Ajustes de "cuánto": un deslizador con su valor a la vista (opacidad, saturación…).
        const current = value ?? field.default ?? field.min ?? 0;
        return (
          <div className="sf-slider">
            <input
              {...common}
              className="sf-slider__range"
              type="range"
              value={current}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(e) => onChange(Number(e.target.value))}
            />
            <output className="sf-slider__value" htmlFor={id}>
              {current}
              {field.unit || ""}
            </output>
          </div>
        );
      }
      return (
        <input
          {...common}
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );
    }
    case "select":
      return (
        <select {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
          <option value="">{field.placeholder || "Elige una opción"}</option>
          {field.options.map((o) => (
            <option key={String(o.value)} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "toggle":
      return (
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          className={`sf-switch ${value ? "is-on" : ""}`}
          disabled={disabled}
          onClick={() => onChange(!value)}
        >
          <span />
        </button>
      );
    case "color":
      return (
        <div className="sf-color">
          <input {...common} className="sf-color__swatch" type="color" value={value || field.default || "#000000"} onChange={(e) => onChange(e.target.value)} />
          <span className="sf-muted">{value || field.default || "Sin color"}</span>
        </div>
      );
    default:
      return null;
  }
}

function ListField({ field, value, onChange, path, errors, audience, media, disabled }) {
  const items = Array.isArray(value) ? value : [];
  const max = field.max ?? 20;
  const itemLabel = field.itemLabel || "Elemento";
  const update = (index, next) => onChange(items.map((item, i) => (i === index ? next : item)));
  const move = (from, to) => {
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="sf-list">
      <ol className="sf-list__items">
        {items.map((item, index) => (
          <li key={index} className="sf-list__item">
            <div className="sf-list__head">
              <strong>
                {itemLabel} {index + 1}
              </strong>
              {!disabled && (
                <div className="sf-list__tools">
                  <button type="button" className="sf-icon-btn" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Subir ${itemLabel} ${index + 1}`}>
                    ↑
                  </button>
                  <button type="button" className="sf-icon-btn" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label={`Bajar ${itemLabel} ${index + 1}`}>
                    ↓
                  </button>
                  <button type="button" className="sf-icon-btn" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label={`Eliminar ${itemLabel} ${index + 1}`}>
                    ✕
                  </button>
                </div>
              )}
            </div>
            <FieldControl
              field={field.item}
              name={`${itemLabel} ${index + 1}`}
              path={`${path}.${index}`}
              value={item}
              onChange={(next) => update(index, next)}
              errors={errors}
              audience={audience}
              media={media}
              disabled={disabled}
              hideLabel={field.item.type !== "group"}
            />
          </li>
        ))}
      </ol>
      {!disabled && items.length < max && (
        <button type="button" className="sf-add sf-add--wide" onClick={() => onChange([...items, getItemDefaults(field)])}>
          <span aria-hidden="true">＋</span> Agregar {itemLabel.toLowerCase()}
        </button>
      )}
      <p className="sf-muted sf-small">
        {items.length}/{max}
        {field.min ? ` · mínimo ${field.min}` : ""}
      </p>
    </div>
  );
}

/** Renderiza cualquier campo del DSL. Los grupos y listas se renderizan recursivamente. */
export function FieldControl({ field, name, path, value, onChange, errors, audience, media, disabled, hideLabel = false }) {
  const id = useId();
  const error = errors[path];
  const label = labelFor(field, audience) || name;
  const description = descriptionFor(field, audience);
  const describedBy = [description && `${id}-desc`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  const length = LENGTH_TYPES.has(field.type) && typeof value === "string" ? value.length : null;

  let control;
  if (field.type === "group") {
    control = (
      <div className="sf-group">
        {Object.entries(field.fields).map(([key, sub]) => (
          <FieldControl
            key={key}
            field={sub}
            name={key}
            path={`${path}.${key}`}
            value={value?.[key]}
            onChange={(next) => onChange({ ...(value || {}), [key]: next })}
            errors={errors}
            audience={audience}
            media={media}
            disabled={disabled}
          />
        ))}
      </div>
    );
  } else if (field.type === "list") {
    control = <ListField field={field} value={value} onChange={onChange} path={path} errors={errors} audience={audience} media={media} disabled={disabled} />;
  } else if (field.type === "images") {
    control = <ImagesField field={field} value={value || []} onChange={onChange} media={media} disabled={disabled} inputId={id} />;
  } else if (["image", "audio", "video"].includes(field.type)) {
    control = <MediaField field={field} value={value} onChange={onChange} media={media} disabled={disabled} inputId={id} />;
  } else {
    control = <ScalarInput field={field} value={value} onChange={onChange} id={id} invalid={Boolean(error)} describedBy={describedBy} disabled={disabled} />;
  }

  const inline = field.type === "toggle";
  return (
    <div className={`sf-field sf-field--${field.type} ${error ? "has-error" : ""} ${inline ? "sf-field--inline" : ""}`} data-path={path}>
      {!hideLabel && (
        <div className="sf-field__label-row">
          <label className="sf-label" htmlFor={id}>
            {label}
            {!field.required && field.type !== "toggle" && field.type !== "group" && <span className="sf-optional"> (opcional)</span>}
          </label>
          {length !== null && field.max ? (
            <span className={`sf-counter ${length > field.max ? "is-over" : ""}`}>
              {length}/{field.max}
            </span>
          ) : null}
        </div>
      )}
      {description && !hideLabel && (
        <p id={`${id}-desc`} className="sf-description">
          {description}
        </p>
      )}
      {control}
      {error && (
        <p id={`${id}-err`} className="sf-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
