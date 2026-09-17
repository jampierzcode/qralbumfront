import { Link } from "react-router-dom";
import { Alert } from "antd";
import { adminApi } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { money } from "../lib/gifts.js";
import { formatDate } from "../lib/format.js";
import { PageHeader } from "../components/ui.jsx";
import { PageSkeleton } from "../components/Skeletons.jsx";

/** Lo que ve un referido: cuánto debe pagar y qué está esperando aprobación. */
export default function AccountPage() {
  const { data, loading } = useRequest(() => adminApi.myAccount(), []);
  if (loading && !data) return <PageSkeleton />;

  const s = data?.summary || {};

  return (
    <div className="adm-page">
      <PageHeader title="Mi cuenta" subtitle="Tus regalos y lo que tienes que pagar" />

      <div className="adm-stats">
        <div className="adm-stat">
          <span className="adm-stat__label">Por pagar</span>
          <span className="adm-stat__value">{money(s.owed, s.currency)}</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__label">Ya pagado</span>
          <span className="adm-stat__value">{money(s.paid, s.currency)}</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__label">Esperando aprobación</span>
          <span className="adm-stat__value">{s.pending || 0}</span>
        </div>
        <div className="adm-stat">
          <span className="adm-stat__label">Regalos creados</span>
          <span className="adm-stat__value">{s.gifts || 0}</span>
        </div>
      </div>

      {s.owed > 0 && (
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
          message={`Tienes ${money(s.owed, s.currency)} por pagar`}
          description="Yapea el monto y avisa por WhatsApp para que se marque como pagado."
        />
      )}

      <Section title="Esperando aprobación" items={data?.pendingGifts} empty="No tienes regalos esperando aprobación." />
      <Section title="Aprobados sin pagar" items={data?.unpaidGifts} empty="No debes nada. ¡Gracias!" showPrice />
    </div>
  );
}

function Section({ title, items = [], empty, showPrice = false }) {
  return (
    <section style={{ marginTop: 24 }}>
      <h2 className="adm-section-title">{title}</h2>
      {items.length === 0 ? (
        <p className="adm-muted">{empty}</p>
      ) : (
        <div className="adm-rows">
          {items.map((g) => (
            <Link key={g.id} to={`/admin/gifts/${g.id}`} className="adm-row">
              <div className="adm-row__main">
                <span className="adm-row__title">{g.recipientName || "Sin destinatario"}</span>
                <span className="adm-row__meta">
                  {showPrice ? `${money(g.price, g.currency)} · ` : ""}
                  {formatDate(g.submittedAt || g.reviewedAt || g.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
