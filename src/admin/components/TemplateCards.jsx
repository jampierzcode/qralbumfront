import { useLayoutEffect, useRef, useState } from "react";
import { Button, Modal } from "antd";
import { ExportOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { TemplateThumb } from "./ui.jsx";
import DevicePreview from "./DevicePreview.jsx";
import { demoUrl, occasionLabel } from "../lib/gifts.js";
import { getTemplate } from "../../engine/registry.js";

const canHover = () => typeof window !== "undefined" && window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

/** Miniatura que, al pasar el mouse, muestra la experiencia animada real (demo en modo miniatura). */
export function LiveTemplateThumb({ templateId }) {
  const [live, setLive] = useState(false);
  const box = useRef(null);
  const [scale, setScale] = useState(0.5);
  const VIEW = { width: 520, height: 390 };

  useLayoutEffect(() => {
    if (!live || !box.current) return;
    setScale(box.current.clientWidth / VIEW.width);
  }, [live]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={box}
      style={{ position: "absolute", inset: 0 }}
      onMouseEnter={() => canHover() && setLive(true)}
      onMouseLeave={() => setLive(false)}
    >
      <TemplateThumb templateId={templateId} />
      {live && (
        <iframe
          title="Vista animada"
          src={`/demo/${templateId}?preview=1`}
          className="adm-thumb__frame"
          width={VIEW.width}
          height={VIEW.height}
          style={{ width: VIEW.width, height: VIEW.height, transform: `scale(${scale})` }}
          tabIndex={-1}
        />
      )}
    </div>
  );
}

export function TemplateDemoModal({ templateId, open, onClose, onChoose }) {
  const template = getTemplate(templateId);
  if (!template) return null;
  const gift = { templateId, ...template.demo.gift };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="min(1100px, 96vw)"
      title={template.manifest.name}
      destroyOnHidden
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <Button icon={<ExportOutlined />} href={demoUrl(templateId)} target="_blank" rel="noreferrer">
            Abrir demo en otra pestaña
          </Button>
          {onChoose && (
            <Button type="primary" onClick={onChoose}>
              Usar esta plantilla
            </Button>
          )}
        </div>
      }
      styles={{ body: { height: "min(72vh, 760px)" } }}
    >
      <DevicePreview gift={gift} media={template.demo.media} defaultAutoOpen={false} />
    </Modal>
  );
}

export function TemplateChoiceCard({ templateId, name, description, selected, onChoose, onDemo }) {
  const template = getTemplate(templateId);
  const occasions = template?.manifest.occasions || [];
  return (
    <div className="adm-template-card">
      <button type="button" className={`adm-choice ${selected ? "is-selected" : ""}`} onClick={onChoose} aria-pressed={selected}>
        <div className="adm-choice__media">
          <LiveTemplateThumb templateId={templateId} />
        </div>
        <div>
          <h3 className="adm-choice__title">{name || template?.manifest.name}</h3>
          <p className="adm-choice__text">{description ?? template?.manifest.description}</p>
        </div>
      </button>
      {occasions.length > 0 && (
        <div className="adm-tags">
          {occasions.slice(0, 4).map((o) => (
            <span key={o} className="adm-tag">
              {occasionLabel(o)}
            </span>
          ))}
        </div>
      )}
      <div className="adm-template-card__actions">
        <Button icon={<PlayCircleOutlined />} onClick={onDemo}>
          Ver demo
        </Button>
        <Button type={selected ? "primary" : "default"} onClick={onChoose}>
          {selected ? "Elegida" : "Elegir"}
        </Button>
      </div>
    </div>
  );
}
