import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCustomerEditableKeys, getDefaults, mergeBoundValues, validateContent } from "../../gift-core/index.js";
import { getTemplate, listTemplates } from "../engine/registry.js";
import SchemaForm from "../editor/SchemaForm.jsx";
import "./dev.css";

// Adaptador de media simulado: sube "en local" con progreso falso.
function useMockMedia(initialAssets) {
  const [assets, setAssets] = useState(initialAssets);
  const upload = useCallback(async (file, { kind, onProgress, signal }) => {
    for (let p = 0; p <= 1; p += 0.2) {
      if (signal?.aborted) throw Object.assign(new Error("cancelado"), { name: "AbortError" });
      onProgress?.(p);
      await new Promise((r) => setTimeout(r, 120));
    }
    if (file.name.includes("error")) throw new Error("Error simulado (el nombre contiene 'error').");
    const id = `local-${crypto.randomUUID()}`;
    const asset = { id, kind, url: URL.createObjectURL(file), thumbUrl: kind === "image" ? URL.createObjectURL(file) : null, originalName: file.name };
    setAssets((prev) => ({ ...prev, [id]: asset }));
    return asset;
  }, []);
  return useMemo(() => ({ assets, upload, remove: () => {} }), [assets, upload]);
}

/** /dev/schema/:templateId — editor generado + validación en vivo. Sólo en desarrollo. */
export default function SchemaPlayground() {
  const { templateId = listTemplates()[0]?.manifest.id } = useParams();
  const template = getTemplate(templateId);
  const [useDemo, setUseDemo] = useState(true);

  const initial = useMemo(() => {
    if (!template) return {};
    return useDemo ? mergeBoundValues(template.demo.gift.content, template.demo.gift) : getDefaults(template.schema);
  }, [template, useDemo]);

  const [values, setValues] = useState(initial);
  const [audience, setAudience] = useState("admin");
  const media = useMockMedia(template ? Object.fromEntries(Object.entries(template.demo.media).map(([id, a]) => [id, { id, ...a, thumbUrl: a.url }])) : {});
  const [lastTemplate, setLastTemplate] = useState(templateId);
  if (lastTemplate !== templateId) {
    setLastTemplate(templateId);
    setValues(initial);
  }

  if (!template) return <p style={{ padding: 24 }}>Plantilla no encontrada.</p>;

  const assetKinds = Object.fromEntries(Object.entries(media.assets).map(([id, a]) => [id, { kind: a.kind }]));
  const draft = validateContent(template.schema, values, { mode: "draft", assets: assetKinds });
  const publish = validateContent(template.schema, values, { mode: "publish", assets: assetKinds });

  return (
    <div className="dev-page">
      <header className="dev-bar">
        <strong>Schema playground</strong>
        <nav>
          {listTemplates().map((t) => (
            <Link key={t.manifest.id} to={`/dev/schema/${t.manifest.id}`} aria-current={t.manifest.id === templateId ? "page" : undefined}>
              {t.manifest.name}
            </Link>
          ))}
        </nav>
        <label>
          <input type="checkbox" checked={useDemo} onChange={(e) => (setUseDemo(e.target.checked), setValues(e.target.checked ? mergeBoundValues(template.demo.gift.content, template.demo.gift) : getDefaults(template.schema)))} /> Contenido demo
        </label>
        <select value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="admin">Vista admin</option>
          <option value="customer">Vista comprador</option>
        </select>
      </header>
      <div className="dev-columns">
        <main className="dev-form">
          <SchemaForm
            schema={template.schema}
            values={values}
            onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
            errors={draft.errors}
            audience={audience}
            keys={audience === "customer" ? getCustomerEditableKeys(template.schema) : undefined}
            media={media}
          />
        </main>
        <aside className="dev-inspector">
          <h4>Publicación</h4>
          {publish.valid ? <p className="dev-ok">✓ Listo para publicar</p> : (
            <ul>{publish.errors.map((e) => <li key={e.path + e.message}><code>{e.path}</code> {e.message}</li>)}</ul>
          )}
          <h4>Valor saneado</h4>
          <pre>{JSON.stringify(draft.value, null, 2)}</pre>
        </aside>
      </div>
    </div>
  );
}
