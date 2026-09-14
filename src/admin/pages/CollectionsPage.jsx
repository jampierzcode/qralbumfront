import { useEffect, useMemo, useRef, useState } from "react";
import { App, Button, Checkbox, Drawer, Form, Input, Switch } from "antd";
import { CameraOutlined, PlusOutlined } from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { plural } from "../lib/format.js";
import { CollectionCover, EmptyState, PageHeader, TemplateThumb } from "../components/ui.jsx";
import { RowsSkeleton } from "../components/Skeletons.jsx";
import SortableList from "../components/SortableList.jsx";

function Cover({ collection, large = false }) {
  return (
    <div className={large ? "adm-choice__media" : "adm-cover"} style={large ? { borderRadius: 14 } : undefined}>
      <CollectionCover collection={collection} emptyLabel={large ? "Sin plantillas" : ""} />
    </div>
  );
}

function CollectionDrawer({ collection, templates, open, onClose, onSaved }) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const creating = !collection?.id;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ name: collection?.name || "", description: collection?.description || "", isActive: collection?.isActive ?? true });
    setSelected(collection?.templateIds || []);
  }, [open, collection, form]);

  const byId = useMemo(() => Object.fromEntries(templates.map((t) => [t.templateId, t])), [templates]);

  const save = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      let saved;
      if (creating) saved = await adminApi.createCollection({ ...values, templateIds: selected });
      else {
        await adminApi.updateCollection(collection.id, values);
        saved = await adminApi.setCollectionTemplates(collection.id, selected);
      }
      onSaved(saved, creating);
      message.success(creating ? "Colección creada" : "Colección guardada");
      onClose();
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const uploadCover = async (file) => {
    setUploading(true);
    try {
      const saved = await adminApi.uploadCollectionCover(collection.id, file);
      onSaved(saved, false);
      message.success("Portada actualizada");
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      title={creating ? "Nueva colección" : "Editar colección"}
      destroyOnHidden
      extra={
        <Button type="primary" loading={saving} onClick={save}>
          {creating ? "Crear" : "Guardar"}
        </Button>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        {!creating && (
          <div className="adm-field">
            <span className="adm-field__label">Portada</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 180 }}>
                <Cover collection={collection} large />
              </div>
              <Button icon={<CameraOutlined />} loading={uploading} onClick={() => fileInput.current?.click()}>
                {collection.coverUrl ? "Cambiar portada" : "Subir portada"}
              </Button>
              <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => (e.target.files?.[0] && uploadCover(e.target.files[0]), (e.target.value = ""))} />
            </div>
            <p className="adm-field__hint">Sin portada se muestra un mosaico de sus plantillas.</p>
          </div>
        )}
        <Form.Item name="name" label="Nombre" rules={[{ required: true, whitespace: true, message: "Escribe un nombre." }]}>
          <Input size="large" placeholder="San Valentín" maxLength={120} />
        </Form.Item>
        <Form.Item name="description" label="Descripción">
          <Input.TextArea placeholder="Cartas y detalles para el 14 de febrero." autoSize={{ minRows: 2, maxRows: 4 }} maxLength={1000} />
        </Form.Item>
        <Form.Item name="isActive" label="Visible al crear regalos" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>

      <div className="adm-section__head" style={{ marginTop: 8 }}>
        <h3 className="adm-section__title">Plantillas en esta colección</h3>
        <span className="adm-muted adm-small">{selected.length}</span>
      </div>
      {selected.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SortableList
            items={selected}
            getId={(id) => id}
            onReorder={setSelected}
            renderItem={(id) => (
              <>
                <TemplateThumb templateId={id} size="sm" />
                <div className="adm-row__main">
                  <span className="adm-row__title">{byId[id]?.name || id}</span>
                </div>
                <Button type="text" onClick={() => setSelected((s) => s.filter((x) => x !== id))}>
                  Quitar
                </Button>
              </>
            )}
          />
        </div>
      )}
      <p className="adm-muted adm-small">Agregar:</p>
      <div style={{ display: "grid", gap: 8 }}>
        {templates
          .filter((t) => !selected.includes(t.templateId))
          .map((t) => (
            <Checkbox key={t.templateId} checked={false} onChange={() => setSelected((s) => [...s, t.templateId])}>
              {t.name}
            </Checkbox>
          ))}
        {templates.every((t) => selected.includes(t.templateId)) && <span className="adm-muted adm-small">Todas las plantillas ya están en la colección.</span>}
      </div>
    </Drawer>
  );
}

export default function CollectionsPage() {
  const { message } = App.useApp();
  const { data, loading, error, reload, setData } = useRequest(() => Promise.all([adminApi.collections(), adminApi.templates()]), []);
  const [editing, setEditing] = useState(null);
  const collections = data?.[0].items || [];
  const templates = data?.[1].items || [];

  const setCollections = (updater) => setData((d) => [{ items: updater(d[0].items) }, d[1]]);

  const toggle = async (c, isActive) => {
    setCollections((list) => list.map((x) => (x.id === c.id ? { ...x, isActive } : x)));
    try {
      await adminApi.updateCollection(c.id, { isActive });
    } catch (err) {
      message.error(errorMessage(err));
      reload();
    }
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Colecciones"
        subtitle="Organiza las plantillas por ocasión. Arrastra para cambiar el orden en que aparecen."
        actions={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setEditing({})}>
            Nueva colección
          </Button>
        }
      />

      {error ? (
        <EmptyState icon="!" title="No pudimos cargar las colecciones" text={error} action={<Button onClick={reload}>Reintentar</Button>} />
      ) : loading ? (
        <RowsSkeleton />
      ) : collections.length === 0 ? (
        <EmptyState
          icon="▦"
          title="Aún no hay colecciones"
          text="Agrupa tus plantillas por ocasión: Amor, Cumpleaños, Aniversario…"
          action={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
              Nueva colección
            </Button>
          }
        />
      ) : (
        <SortableList
          items={collections}
          getId={(c) => c.id}
          onReorder={async (next) => {
            setCollections(() => next);
            try {
              await adminApi.reorderCollections(next.map((c) => c.id));
            } catch (err) {
              message.error(errorMessage(err));
              reload();
            }
          }}
          renderItem={(c) => (
            <>
              <Cover collection={c} />
              <button type="button" className="adm-row__main" style={{ border: 0, background: "none", textAlign: "left", cursor: "pointer", padding: 0, font: "inherit", color: "inherit" }} onClick={() => setEditing(c)}>
                <span className="adm-row__title">{c.name}</span>
                <span className="adm-row__meta">
                  {plural(c.templateIds.length, "plantilla", "plantillas")}
                  {c.description ? ` · ${c.description}` : ""}
                </span>
              </button>
              <Switch checked={c.isActive} onChange={(v) => toggle(c, v)} aria-label={`Visible: ${c.name}`} />
              <Button type="text" onClick={() => setEditing(c)}>
                Editar
              </Button>
            </>
          )}
        />
      )}

      <CollectionDrawer
        open={Boolean(editing)}
        collection={editing?.id ? collections.find((c) => c.id === editing.id) || editing : null}
        templates={templates}
        onClose={() => setEditing(null)}
        onSaved={(saved, created) => {
          setCollections((list) => (created ? [...list, saved] : list.map((c) => (c.id === saved.id ? saved : c))));
          if (!created) setEditing((e) => (e ? saved : e));
        }}
      />
    </div>
  );
}
