import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Dropdown, Segmented, Select } from "antd";
import { ArrowLeftOutlined, EyeOutlined, MoreOutlined, QrcodeOutlined } from "@ant-design/icons";
import SchemaForm from "../../editor/SchemaForm.jsx";
import { useGiftEditor } from "../hooks/useGiftEditor.js";
import { giftTitle, occasionLabel, templateName } from "../lib/gifts.js";
import { EmptyState, StatusBadge } from "../components/ui.jsx";
import { PageSkeleton } from "../components/Skeletons.jsx";
import DevicePreview from "../components/DevicePreview.jsx";
import { CustomerPicker } from "../components/customers.jsx";
import { useGiftActions } from "../components/GiftCard.jsx";
import { SaveIndicator, scrollToField, usePublishFlow } from "../components/PublishFlow.jsx";

export default function GiftEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editor = useGiftEditor(id);
  const [tab, setTab] = useState("edit");
  const [device, setDevice] = useState("mobile");
  const formRef = useRef(null);

  const flow = usePublishFlow(editor, {
    onJump: (path) => {
      setTab("edit");
      setTimeout(() => scrollToField(path, formRef.current || document), 60);
    },
  });
  const actions = useGiftActions({
    onChanged: (result) => {
      if (result?.id && result.id === id) editor.setGift((g) => ({ ...g, ...result, media: g.media }));
    },
  });

  if (editor.loadError) {
    return (
      <div className="adm-root adm-page">
        <EmptyState
          icon="!"
          title={editor.loadError.status === 404 ? "Este regalo no existe" : "No pudimos abrir el regalo"}
          text={editor.loadError.message}
          action={
            <Link to="/admin/gifts">
              <Button>Volver a regalos</Button>
            </Link>
          }
        />
      </div>
    );
  }
  if (!editor.gift || !editor.values) return <PageSkeleton />;

  const { gift, template } = editor;
  const published = gift.status === "published";
  const menu = actions.menuFor(gift).filter((item) => item.key !== "edit");

  if (!template) {
    return (
      <div className="adm-root adm-page">
        <EmptyState icon="!" title="La plantilla de este regalo ya no está disponible" text={`Plantilla: ${gift.templateId}`} action={<Link to="/admin/gifts"><Button>Volver</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="adm-root adm-editor">
      <header className="adm-editor__top">
        <Link to="/admin/gifts" className="adm-editor__back" aria-label="Volver a regalos">
          <ArrowLeftOutlined /> <span>Regalos</span>
        </Link>
        <div className="adm-editor__title">
          <strong>{giftTitle(gift)}</strong>
          <StatusBadge status={gift.status} />
        </div>
        <SaveIndicator save={editor.save} />
        <Button className="adm-editor__desktop-only" icon={<EyeOutlined />} onClick={() => editor.flush().then(() => navigate(`/admin/gifts/${id}/preview`))}>
          Preview
        </Button>
        {published ? (
          <Button type="primary" icon={<QrcodeOutlined />} onClick={flow.share}>
            <span className="adm-editor__desktop-only">Link y QR</span>
          </Button>
        ) : (
          <Button type="primary" loading={flow.publishing} onClick={flow.publish}>
            Publicar
          </Button>
        )}
        <Dropdown trigger={["click"]} menu={{ items: menu }} placement="bottomRight">
          <Button icon={<MoreOutlined />} aria-label="Más acciones" />
        </Dropdown>
      </header>

      <div className="adm-editor__tabs">
        <Segmented block value={tab} onChange={setTab} options={[{ value: "edit", label: "Editar" }, { value: "preview", label: "Preview" }]} />
      </div>

      <div className="adm-editor__body" data-tab={tab}>
        <div className="adm-editor__form" ref={formRef}>
          <section className="adm-editor__section">
            <h2 className="adm-editor__section-title">Detalles</h2>
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <span className="adm-field__label">Cliente</span>
              <CustomerPicker value={editor.details.customerId} onChange={(v) => editor.setDetail("customerId", v)} />
            </div>
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <span className="adm-field__label">Ocasión</span>
              <Select
                size="large"
                allowClear
                placeholder="Elige la ocasión"
                value={editor.details.occasion ?? undefined}
                onChange={(v) => editor.setDetail("occasion", v ?? null)}
                options={template.manifest.occasions.map((o) => ({ value: o, label: occasionLabel(o) }))}
              />
            </div>
            <p className="adm-muted adm-small" style={{ margin: 0 }}>
              Plantilla: {templateName(gift.templateId)}
            </p>
          </section>

          <SchemaForm schema={template.schema} values={editor.values} onChange={editor.setValue} errors={editor.errors} media={editor.media} className="adm-sf" />
        </div>

        <div className="adm-editor__preview">
          <DevicePreview gift={editor.previewGift} media={editor.media.assets} device={device} onDeviceChange={setDevice} devices={["mobile", "desktop"]} />
        </div>
      </div>

      {tab === "edit" && (
        <Button className="adm-editor__floating" type="primary" size="large" shape="round" icon={<EyeOutlined />} onClick={() => setTab("preview")}>
          Ver preview
        </Button>
      )}
      {flow.ui}
      {actions.dialogs}
    </div>
  );
}
