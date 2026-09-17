import { App, InputNumber } from "antd";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { money } from "../lib/gifts.js";
import { PageHeader } from "../components/ui.jsx";
import { PageSkeleton } from "../components/Skeletons.jsx";
import PaymentMethods from "../components/PaymentMethods.jsx";
import StoreSettings from "../components/StoreSettings.jsx";
import { TemplateThumb } from "../components/ui.jsx";

/** Mi negocio: a cuánto vendo cada plantilla y con qué me pagan. */
export default function BusinessPage() {
  const { message } = App.useApp();
  const { data, loading, setData } = useRequest(() => adminApi.myCatalog(), []);

  const setPrice = async (templateId, salePrice) => {
    setData((d) => ({ items: d.items.map((t) => (t.templateId === templateId ? { ...t, salePrice } : t)) }));
    try {
      setData(await adminApi.setCatalogPrice(templateId, salePrice ?? ""));
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  if (loading && !data) return <PageSkeleton />;
  const items = data?.items || [];

  return (
    <div className="adm-page">
      <PageHeader title="Mi negocio" subtitle="Tus precios, cómo te pagan y tu link para recibir pedidos" />

      <section className="adm-section">
        <h2 className="adm-section-title">Mis precios</h2>
        <p className="adm-muted adm-small" style={{ marginTop: 0 }}>
          El costo es fijo y es lo que pagas por cada regalo. Tú decides a cuánto lo vendes.
        </p>
        <div className="adm-rows">
          {items.map((t) => {
            const profit = t.salePrice !== null && t.cost !== null ? t.salePrice - t.cost : null;
            return (
              <div key={t.templateId} className="adm-row">
                <TemplateThumb templateId={t.templateId} size="sm" />
                <div className="adm-row__main">
                  <span className="adm-row__title">{t.name}</span>
                  <span className="adm-row__meta">
                    Te cuesta {money(t.cost)}
                    {profit !== null && ` · ganas ${money(profit)}`}
                  </span>
                </div>
                <div className="adm-row__side">
                  <InputNumber
                    min={0}
                    step={1}
                    prefix="S/"
                    style={{ width: 130 }}
                    value={t.salePrice}
                    placeholder="Tu precio"
                    onChange={(v) => setData((d) => ({ items: d.items.map((x) => (x.templateId === t.templateId ? { ...x, salePrice: v } : x)) }))}
                    onBlur={(e) => setPrice(t.templateId, e.target.value === "" ? null : Number(e.target.value))}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <PaymentMethods />

      <StoreSettings />
    </div>
  );
}
