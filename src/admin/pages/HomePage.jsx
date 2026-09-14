import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { adminApi } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useRequest } from "../hooks/useRequest.js";
import { giftTitle, templateName } from "../lib/gifts.js";
import { timeAgo } from "../lib/format.js";
import { EmptyState, PageHeader, StatusBadge, TemplateThumb } from "../components/ui.jsx";
import { RowsSkeleton, Skel } from "../components/Skeletons.jsx";

const STATS = [
  { key: "total", label: "Regalos", to: "/admin/gifts" },
  { key: "draft", label: "Borradores", to: "/admin/gifts?status=draft" },
  { key: "collectingContent", label: "Esperando contenido", to: "/admin/gifts?status=collecting_content" },
  { key: "published", label: "Publicados", to: "/admin/gifts?status=published" },
  { key: "opens", label: "Aperturas" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function HomePage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useRequest(() => adminApi.dashboard(), []);
  const firstName = (user?.name || "").split(" ")[0];
  const today = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return (
    <div className="adm-page">
      <PageHeader
        eyebrow={today.charAt(0).toUpperCase() + today.slice(1)}
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        actions={
          <Link to="/admin/gifts/new">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Nuevo regalo
            </Button>
          </Link>
        }
      />

      {error && (
        <EmptyState icon="!" title="No pudimos cargar el resumen" text={error} action={<Button onClick={reload}>Reintentar</Button>} />
      )}

      {!error && (
        <div className="adm-stats">
          {STATS.map((s) => {
            const content = (
              <>
                <span className="adm-stat__label">{s.label}</span>
                <span className="adm-stat__value">{loading ? <Skel w={40} h={28} /> : data.stats[s.key]}</span>
              </>
            );
            return s.to ? (
              <Link key={s.key} to={s.to} className="adm-stat">
                {content}
              </Link>
            ) : (
              <div key={s.key} className="adm-stat">
                {content}
              </div>
            );
          })}
        </div>
      )}

      {!error && (
        <div className="adm-cols adm-section">
          <section>
            <div className="adm-section__head">
              <h2 className="adm-section__title">Regalos recientes</h2>
              <Link to="/admin/gifts" className="adm-link">
                Ver todos
              </Link>
            </div>
            {loading ? (
              <RowsSkeleton count={4} />
            ) : data.recentGifts.length === 0 ? (
              <EmptyState
                title="Crea tu primer regalo"
                text="Elige una plantilla, personalízala y compártela con un link o un QR."
                action={
                  <Link to="/admin/gifts/new">
                    <Button type="primary" icon={<PlusOutlined />}>
                      Nuevo regalo
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="adm-rows">
                {data.recentGifts.map((gift) => (
                  <Link key={gift.id} to={`/admin/gifts/${gift.id}`} className="adm-row">
                    <TemplateThumb templateId={gift.templateId} size="sm" />
                    <div className="adm-row__main">
                      <span className="adm-row__title">{giftTitle(gift)}</span>
                      <span className="adm-row__meta">
                        {[gift.customer?.name, templateName(gift.templateId), timeAgo(gift.updatedAt)].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                    <div className="adm-row__side">
                      <StatusBadge status={gift.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="adm-section__head">
              <h2 className="adm-section__title">Plantillas más utilizadas</h2>
              <Link to="/admin/templates" className="adm-link">
                Plantillas
              </Link>
            </div>
            {loading ? (
              <RowsSkeleton count={3} />
            ) : data.topTemplates.length === 0 ? (
              <p className="adm-muted">Aún no hay datos.</p>
            ) : (
              <div className="adm-rows">
                {data.topTemplates.map((t) => {
                  const max = data.topTemplates[0].count || 1;
                  return (
                    <div key={t.templateId} className="adm-row">
                      <TemplateThumb templateId={t.templateId} size="sm" />
                      <div className="adm-row__main">
                        <span className="adm-row__title">{templateName(t.templateId)}</span>
                        <div className="adm-bar" aria-hidden="true">
                          <span style={{ width: `${(t.count / max) * 100}%` }} />
                        </div>
                      </div>
                      <div className="adm-row__side">{t.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
