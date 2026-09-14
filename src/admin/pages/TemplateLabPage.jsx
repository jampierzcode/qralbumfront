import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Input, Segmented, Select, Switch } from "antd";
import { ArrowLeftOutlined, RedoOutlined } from "@ant-design/icons";
import { mergeBoundValues } from "../../../gift-core/index.js";
import { getTemplate, listTemplates } from "../../engine/registry.js";
import { adminApi, errorMessage } from "../api.js";
import DevicePreview, { DEVICES } from "../components/DevicePreview.jsx";

const LAB_DEVICES = ["mobile-sm", "mobile", "mobile-land", "tablet", "desktop"];

/**
 * Laboratorio responsive: el MISMO regalo en todos los tamaños a la vez.
 * Fuente: contenido demo de la plantilla o un regalo real (por id).
 */
export default function TemplateLabPage() {
  const { templateId: routeId } = useParams();
  const navigate = useNavigate();
  const templates = listTemplates();
  const templateId = routeId || templates[0]?.manifest.id;
  const template = getTemplate(templateId);

  const [layout, setLayout] = useState("grid");
  const [single, setSingle] = useState("mobile");
  const [intro, setIntro] = useState(false);
  const [run, setRun] = useState(0);
  const [giftIdInput, setGiftIdInput] = useState("");
  const [realGift, setRealGift] = useState(null);
  const [loadError, setLoadError] = useState("");

  const source = useMemo(() => {
    if (realGift) {
      const values = mergeBoundValues(realGift.content, realGift);
      const { recipientName, senderName, ...content } = values;
      return {
        gift: { templateId: realGift.templateId, recipientName, senderName, content },
        media: Object.fromEntries(realGift.media.map((a) => [a.id, a])),
      };
    }
    if (!template) return null;
    return { gift: { templateId, ...template.demo.gift }, media: template.demo.media };
  }, [realGift, template, templateId]);

  const loadGift = async () => {
    setLoadError("");
    try {
      const gift = await adminApi.gift(giftIdInput.trim());
      setRealGift(gift);
      if (gift.templateId !== templateId) navigate(`/admin/lab/${gift.templateId}`);
    } catch (err) {
      setLoadError(errorMessage(err, "No se encontró ese regalo."));
    }
  };

  if (!template) return <div className="adm-root adm-page">Plantilla no encontrada.</div>;

  return (
    <div className="adm-root" style={{ minHeight: "100dvh" }}>
      <header className="adm-editor__top" style={{ position: "sticky", top: 0, zIndex: 20, flexWrap: "wrap" }}>
        <Link to="/admin/templates" className="adm-editor__back">
          <ArrowLeftOutlined /> <span>Plantillas</span>
        </Link>
        <strong style={{ marginRight: "auto" }}>Laboratorio responsive</strong>
        <Select
          value={templateId}
          style={{ minWidth: 180 }}
          onChange={(id) => {
            setRealGift(null);
            navigate(`/admin/lab/${id}`);
          }}
          options={templates.map((t) => ({ value: t.manifest.id, label: t.manifest.name }))}
        />
        <Input.Search
          placeholder="ID de un regalo real (opcional)"
          style={{ width: 280 }}
          value={giftIdInput}
          onChange={(e) => setGiftIdInput(e.target.value)}
          onSearch={loadGift}
          enterButton="Cargar"
          allowClear
          onClear={() => setRealGift(null)}
        />
        <Segmented value={layout} onChange={setLayout} options={[{ value: "grid", label: "Todos" }, { value: "single", label: "Uno" }]} />
        <label className="adm-small adm-muted" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <Switch size="small" checked={intro} onChange={(v) => (setIntro(v), setRun((r) => r + 1))} /> Pantalla de apertura
        </label>
        <Button icon={<RedoOutlined />} onClick={() => setRun((r) => r + 1)}>
          Reiniciar todos
        </Button>
      </header>

      <div style={{ padding: 20 }}>
        <p className="adm-muted" style={{ marginTop: 0 }}>
          {realGift ? `Regalo real para ${realGift.recipientName || "—"}` : "Contenido demo de la plantilla"}. La plantilla adapta su composición a cada tamaño: aquí sólo se escala el marco.
          {loadError && <span style={{ color: "#dc2626" }}> · {loadError}</span>}
        </p>

        {layout === "single" ? (
          <div style={{ height: "calc(100dvh - 150px)" }} key={`single-${run}`}>
            <DevicePreview gift={source.gift} media={source.media} device={single} onDeviceChange={setSingle} devices={LAB_DEVICES} defaultAutoOpen={!intro} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {LAB_DEVICES.map((key) => (
              <div key={`${key}-${run}`} style={{ height: key === "desktop" || key === "mobile-land" ? 360 : 620, gridColumn: key === "desktop" ? "1 / -1" : undefined }}>
                <DevicePreview gift={source.gift} media={source.media} device={key} devices={[key]} toolbar={false} defaultAutoOpen={!intro} />
              </div>
            ))}
          </div>
        )}
        <p className="adm-muted adm-small">Tamaños: {LAB_DEVICES.map((k) => `${DEVICES[k].label} ${DEVICES[k].width}×${DEVICES[k].height}`).join(" · ")}</p>
      </div>
    </div>
  );
}
