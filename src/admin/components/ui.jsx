import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { STATUS } from "../lib/gifts.js";
import { getTemplate } from "../../engine/registry.js";

export function StatusBadge({ status }) {
  const meta = STATUS[status] || { label: status, tone: "neutral" };
  return <span className={`adm-status adm-status--${meta.tone}`}>{meta.label}</span>;
}

export function PageHeader({ eyebrow, title, subtitle, actions, back }) {
  return (
    <>
      {back && (
        <Link to={back.to} className="adm-back">
          <ArrowLeftOutlined /> {back.label}
        </Link>
      )}
      <header className="adm-page-header">
        <div>
          {eyebrow && <p className="adm-page-header__eyebrow">{eyebrow}</p>}
          <h1 className="adm-title">{title}</h1>
          {subtitle && <p className="adm-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="adm-actions">{actions}</div>}
      </header>
    </>
  );
}

export function EmptyState({ icon = "♡", title, text, action }) {
  return (
    <div className="adm-empty">
      <div className="adm-empty__icon" aria-hidden="true">
        {icon}
      </div>
      <p className="adm-empty__title">{title}</p>
      {text && <p className="adm-empty__text">{text}</p>}
      {action}
    </div>
  );
}

/** Portada de colección: imagen subida o hasta 3 plantillas apiladas como tarjetas. */
export function CollectionCover({ collection, emptyLabel = "Próximamente" }) {
  if (collection.coverUrl) return <img src={collection.coverUrl} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
  const ids = collection.templateIds.slice(0, 3);
  const layouts = {
    1: [{}],
    2: [{ "--rot": "-5deg", "--dx": "-9%" }, { "--rot": "5deg", "--dx": "9%", "--dy": "4%" }],
    3: [{ "--rot": "-7deg", "--dx": "-14%", "--dy": "3%" }, { "--dy": "-2%", zIndex: 2 }, { "--rot": "7deg", "--dx": "14%", "--dy": "5%" }],
  };
  return (
    <div className={`adm-stack adm-stack--${ids.length}`} aria-hidden="true">
      {ids.length === 0 ? (
        <div className="adm-stack__empty">
          <span>＋</span>
          {emptyLabel}
        </div>
      ) : (
        ids.map((id, i) => (
          <div key={id} className="adm-stack__card" style={layouts[ids.length][i]}>
            <TemplateThumb templateId={id} />
          </div>
        ))
      )}
    </div>
  );
}

/** Miniatura de una plantilla: imagen propia o composición con su paleta. */
export function TemplateThumb({ templateId, size, className = "" }) {
  const template = getTemplate(templateId);
  const theme = template?.manifest.theme || {};
  const style = {
    "--thumb-bg": theme.background || "#1b1a18",
    "--thumb-fg": theme.foreground || "#fff",
    "--thumb-accent": theme.accent || "#f5c451",
  };
  return (
    <div className={`adm-thumb ${size === "sm" ? "adm-thumb--sm" : ""} ${className}`} style={style} aria-hidden="true">
      {template?.thumbnail ? (
        <img src={template.thumbnail} alt="" loading="lazy" decoding="async" />
      ) : (
        <div className="adm-thumb__fallback">
          <span className="adm-thumb__name">{template?.manifest.name || templateId}</span>
        </div>
      )}
    </div>
  );
}
