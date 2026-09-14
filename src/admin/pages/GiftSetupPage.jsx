import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Drawer } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { BOUND_KEYS, getSteps } from "../../../gift-core/index.js";
import SchemaForm from "../../editor/SchemaForm.jsx";
import { useGiftEditor } from "../hooks/useGiftEditor.js";
import { giftTitle } from "../lib/gifts.js";
import { EmptyState, StatusBadge } from "../components/ui.jsx";
import { PageSkeleton } from "../components/Skeletons.jsx";
import DevicePreview from "../components/DevicePreview.jsx";
import { SaveIndicator, scrollToField, usePublishFlow } from "../components/PublishFlow.jsx";
import { WizardProgress } from "./GiftWizardPage.jsx";

/** Pasos 4+ del wizard: generados desde el schema de la plantilla, y paso final de preview. */
export default function GiftSetupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const editor = useGiftEditor(id);
  const [previewOpen, setPreviewOpen] = useState(false);

  const steps = useMemo(() => {
    if (!editor.template) return [];
    return getSteps(editor.template.schema)
      .map((s) => ({ ...s, fields: s.fields.filter(([key]) => !BOUND_KEYS.includes(key)) }))
      .filter((s) => s.fields.length);
  }, [editor.template]);

  const index = Math.min(Number(params.get("step")) || 0, steps.length);
  const isFinal = index === steps.length;
  const step = steps[index];

  const goTo = (i) => {
    setParams({ step: String(i) });
    window.scrollTo({ top: 0 });
  };

  const flow = usePublishFlow(editor, {
    onJump: (path) => {
      const key = path.split(".")[0];
      const target = steps.findIndex((s) => s.fields.some(([k]) => k === key));
      if (target >= 0) goTo(target);
      setTimeout(() => scrollToField(path), 250);
    },
  });

  if (editor.loadError) {
    return (
      <div className="adm-root adm-page">
        <EmptyState icon="!" title="No pudimos abrir este regalo" text={editor.loadError.message} action={<Link to="/admin/gifts"><Button>Volver a regalos</Button></Link>} />
      </div>
    );
  }
  if (!editor.gift || !editor.values) return <PageSkeleton />;

  const total = 3 + steps.length + 1;
  const preview = <DevicePreview gift={editor.previewGift} media={editor.media.assets} devices={isFinal ? ["mobile", "desktop"] : ["mobile"]} toolbar={isFinal} />;

  return (
    <div className="adm-root" style={{ minHeight: "100dvh" }}>
      <header className="adm-editor__top" style={{ position: "sticky", top: 0, zIndex: 20 }}>
        <Button type="text" icon={<CloseOutlined />} onClick={() => navigate(`/admin/gifts/${id}`)} aria-label="Salir del asistente" />
        <div className="adm-editor__title">
          <strong>{giftTitle(editor.gift)}</strong>
          <StatusBadge status={editor.gift.status} />
        </div>
        <SaveIndicator save={editor.save} />
      </header>

      <div className="adm-page" style={{ maxWidth: 1180 }}>
        <WizardProgress current={4 + index} total={total} label={isFinal ? "Vista previa" : step?.title} />

        {!isFinal && step && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 560px) minmax(0, 1fr)", gap: 40 }} className="adm-setup">
            <div>
              <h1 className="adm-title" style={{ marginBottom: 8 }}>
                {step.title}
              </h1>
              {step.description && <p className="adm-subtitle">{step.description}</p>}
              <div style={{ marginTop: 28 }}>
                <SchemaForm
                  schema={editor.template.schema}
                  values={editor.values}
                  onChange={editor.setValue}
                  errors={editor.errors}
                  stepIds={[step.id]}
                  media={editor.media}
                  showStepTitles={false}
                  className="adm-sf"
                />
              </div>
              <div className="adm-footer-bar adm-footer-bar--sticky" style={{ bottom: 0 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => (index === 0 ? navigate(`/admin/gifts/${id}`) : goTo(index - 1))}>
                  Atrás
                </Button>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button className="adm-setup__preview-btn" icon={<EyeOutlined />} onClick={() => setPreviewOpen(true)}>
                    Preview
                  </Button>
                  <Button type="primary" size="large" icon={<ArrowRightOutlined />} iconPosition="end" onClick={() => editor.flush().then(() => goTo(index + 1))}>
                    {index === steps.length - 1 ? "Ver resultado" : "Siguiente"}
                  </Button>
                </div>
              </div>
            </div>
            <aside className="adm-setup__aside" style={{ position: "sticky", top: 90, height: "calc(100dvh - 130px)" }}>
              {preview}
            </aside>
          </div>
        )}

        {isFinal && (
          <div style={{ display: "grid", gap: 24 }}>
            <div className="adm-page-header" style={{ marginBottom: 0 }}>
              <div>
                <h1 className="adm-title">Así se verá el regalo</h1>
                <p className="adm-subtitle">Revísalo en celular y computadora. Puedes publicarlo o seguir editando.</p>
              </div>
              <div className="adm-actions">
                <Button onClick={() => goTo(Math.max(0, steps.length - 1))} icon={<ArrowLeftOutlined />}>
                  Atrás
                </Button>
                <Link to={`/admin/gifts/${id}`}>
                  <Button>Abrir editor</Button>
                </Link>
                {editor.gift.status === "published" ? (
                  <Button type="primary" size="large" onClick={flow.share}>
                    Link y QR
                  </Button>
                ) : (
                  <Button type="primary" size="large" loading={flow.publishing} onClick={flow.publish}>
                    Publicar
                  </Button>
                )}
              </div>
            </div>
            <div style={{ height: "min(78vh, 900px)" }}>{preview}</div>
          </div>
        )}
      </div>

      <Drawer open={previewOpen} onClose={() => setPreviewOpen(false)} placement="bottom" height="92dvh" title="Vista previa" destroyOnHidden>
        <div style={{ height: "100%" }}>
          <DevicePreview gift={editor.previewGift} media={editor.media.assets} devices={["mobile", "desktop"]} />
        </div>
      </Drawer>
      {flow.ui}
    </div>
  );
}
