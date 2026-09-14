import { useState } from "react";
import { App, Button, Modal } from "antd";
import { errorDetails, errorMessage } from "../api.js";
import ShareDialog from "./ShareDialog.jsx";

/**
 * Publicar con validación previa: si faltan datos muestra la lista (clic → ir al campo);
 * si todo está bien publica y abre link + QR.
 */
export function usePublishFlow(editor, { onJump } = {}) {
  const { message } = App.useApp();
  const [issues, setIssues] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const publish = async () => {
    const local = editor.publishIssues();
    if (local.length) {
      setIssues(local);
      return;
    }
    setPublishing(true);
    try {
      await editor.setStatus("published");
      setJustPublished(true);
      setShareOpen(true);
    } catch (err) {
      const details = errorDetails(err);
      if (details.length) setIssues(details);
      else message.error(errorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const share = () => {
    setJustPublished(false);
    setShareOpen(true);
  };

  const ui = (
    <>
      <Modal
        open={Boolean(issues)}
        onCancel={() => setIssues(null)}
        title="Faltan algunos datos para publicar"
        footer={<Button onClick={() => setIssues(null)}>Entendido</Button>}
        width={460}
      >
        <p className="adm-muted" style={{ marginTop: 0 }}>
          Completa esto y vuelve a publicar:
        </p>
        <ul className="adm-issues">
          {(issues || []).map((issue) => (
            <li key={issue.path + issue.message}>
              <button
                type="button"
                onClick={() => {
                  setIssues(null);
                  onJump?.(issue.path);
                }}
              >
                {issue.message}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
      <ShareDialog gift={editor.gift} open={shareOpen} onClose={() => setShareOpen(false)} justPublished={justPublished} />
    </>
  );

  return { publish, publishing, share, ui };
}

/** Desplaza hasta un campo del formulario y lo resalta. */
export function scrollToField(path, container = document) {
  const selectors = [path, path.split(".").slice(0, 2).join("."), path.split(".")[0]];
  for (const candidate of selectors) {
    const el = container.querySelector(`[data-path="${candidate}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("adm-flash");
      void el.offsetWidth;
      el.classList.add("adm-flash");
      el.querySelector("input, textarea, select, button")?.focus({ preventScroll: true });
      return true;
    }
  }
  return false;
}

export function SaveIndicator({ save }) {
  const labels = {
    idle: "",
    pending: "Cambios sin guardar",
    saving: "Guardando…",
    saved: "Guardado ✓",
    error: save.error || "No se pudo guardar",
  };
  return (
    <span className={`adm-save ${save.status === "error" ? "adm-save--error" : ""}`} role="status" aria-live="polite">
      {labels[save.status]}
    </span>
  );
}
