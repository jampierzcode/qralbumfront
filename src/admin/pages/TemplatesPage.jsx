import { useState } from "react";
import { App, Button, Form, Input, Modal, Segmented, Switch, Tooltip } from "antd";
import { EditOutlined, ExperimentOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { occasionLabel } from "../lib/gifts.js";
import { plural } from "../lib/format.js";
import { EmptyState, PageHeader } from "../components/ui.jsx";
import { GiftGridSkeleton } from "../components/Skeletons.jsx";
import { LiveTemplateThumb, TemplateDemoModal } from "../components/TemplateCards.jsx";
import SortableList from "../components/SortableList.jsx";
import { TemplateThumb } from "../components/ui.jsx";

function EditTemplateModal({ template, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const { message } = App.useApp();
  if (!template) return null;
  return (
    <Modal
      open
      title={`Editar ${template.manifest?.name || template.templateId}`}
      onCancel={onClose}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={saving}
      onOk={async () => {
        const values = await form.validateFields();
        setSaving(true);
        try {
          onSaved(await adminApi.updateTemplate(template.templateId, values));
          message.success("Plantilla actualizada");
          onClose();
        } catch (err) {
          message.error(errorMessage(err));
        } finally {
          setSaving(false);
        }
      }}
    >
      <p className="adm-muted">El nombre y la descripción comerciales. Déjalos vacíos para usar los del código.</p>
      <Form form={form} layout="vertical" initialValues={{ name: template.nameOverride || "", description: template.descriptionOverride || "" }}>
        <Form.Item name="name" label="Nombre visible">
          <Input placeholder={template.manifest?.name} maxLength={120} />
        </Form.Item>
        <Form.Item name="description" label="Descripción">
          <Input.TextArea placeholder={template.manifest?.description} autoSize={{ minRows: 2, maxRows: 5 }} maxLength={1000} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function TemplatesPage() {
  const { message } = App.useApp();
  const { data, loading, error, reload, setData } = useRequest(() => adminApi.templates(), []);
  const [view, setView] = useState("grid");
  const [demo, setDemo] = useState(null);
  const [editing, setEditing] = useState(null);
  const items = data?.items || [];

  const replace = (updated) => setData((d) => ({ ...d, items: d.items.map((t) => (t.templateId === updated.templateId ? updated : t)) }));

  const toggle = async (t, isActive) => {
    replace({ ...t, isActive });
    try {
      replace(await adminApi.updateTemplate(t.templateId, { isActive }));
    } catch (err) {
      replace(t);
      message.error(errorMessage(err));
    }
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Plantillas"
        subtitle={data ? `${plural(items.length, "plantilla", "plantillas")} · el código de cada una vive en src/templates` : " "}
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "Galería" },
              { value: "order", label: "Ordenar" },
            ]}
          />
        }
      />

      {error ? (
        <EmptyState icon="!" title="No pudimos cargar las plantillas" text={error} action={<Button onClick={reload}>Reintentar</Button>} />
      ) : loading ? (
        <GiftGridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState icon="◇" title="No hay plantillas" text="Crea una carpeta en src/templates y reinicia el servidor: aparecerá aquí automáticamente." />
      ) : view === "order" ? (
        <SortableList
          items={items}
          getId={(t) => t.templateId}
          onReorder={async (next) => {
            setData((d) => ({ ...d, items: next }));
            try {
              await adminApi.reorderTemplates(next.map((t) => t.templateId));
            } catch (err) {
              message.error(errorMessage(err));
              reload();
            }
          }}
          renderItem={(t) => (
            <>
              <TemplateThumb templateId={t.templateId} size="sm" />
              <div className="adm-row__main">
                <span className="adm-row__title">{t.name}</span>
                <span className="adm-row__meta">{t.isActive ? "Activa" : "Oculta"}</span>
              </div>
            </>
          )}
        />
      ) : (
        <div className="adm-choice-grid">
          {items.map((t) => (
            <article key={t.templateId} className="adm-template-card" style={{ opacity: t.isActive ? 1 : 0.6 }}>
              <div className="adm-choice__media" style={{ borderRadius: 16 }}>
                <LiveTemplateThumb templateId={t.templateId} />
                <span className="adm-choice__count">{plural(t.giftsCount, "regalo", "regalos")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h3 className="adm-choice__title">{t.name}</h3>
                  <p className="adm-choice__text">{t.description}</p>
                </div>
                <Tooltip title={t.isActive ? "Visible al crear regalos" : "Oculta al crear regalos"}>
                  <Switch checked={t.isActive} onChange={(v) => toggle(t, v)} aria-label={`Activar ${t.name}`} />
                </Tooltip>
              </div>
              {!t.available && <p style={{ color: "#dc2626", margin: 0 }}>El código de esta plantilla ya no existe en el repositorio.</p>}
              <div className="adm-tags">
                {(t.manifest?.occasions || []).map((o) => (
                  <span key={o} className="adm-tag">
                    {occasionLabel(o)}
                  </span>
                ))}
              </div>
              <p className="adm-muted adm-small" style={{ margin: 0 }}>
                {t.collections.length ? `En ${t.collections.map((c) => c.name).join(", ")}` : "Sin colección"}
                {t.manifest ? ` · v${t.manifest.version}` : ""}
              </p>
              <div className="adm-template-card__actions">
                <Button icon={<PlayCircleOutlined />} onClick={() => setDemo(t.templateId)} disabled={!t.available}>
                  Ver demo
                </Button>
                <Button icon={<EditOutlined />} onClick={() => setEditing(t)}>
                  Editar
                </Button>
                {import.meta.env.DEV && (
                  <Tooltip title="Editor generado desde el schema (sólo desarrollo)">
                    <Button icon={<ExperimentOutlined />} href={`/dev/schema/${t.templateId}`} target="_blank" aria-label="Schema playground" />
                  </Tooltip>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <TemplateDemoModal templateId={demo} open={Boolean(demo)} onClose={() => setDemo(null)} />
      <EditTemplateModal template={editing} onClose={() => setEditing(null)} onSaved={replace} />
    </div>
  );
}
