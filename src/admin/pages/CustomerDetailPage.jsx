import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { App, Button } from "antd";
import { EditOutlined, MailOutlined, PlusOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { adminApi } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { formatDate, initials, plural, timeAgo } from "../lib/format.js";
import { whatsappUrl } from "../lib/gifts.js";
import { EmptyState, PageHeader } from "../components/ui.jsx";
import { GiftGridSkeleton, Skel } from "../components/Skeletons.jsx";
import { CustomerFormModal } from "../components/customers.jsx";
import GiftCard, { useGiftActions } from "../components/GiftCard.jsx";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { message } = App.useApp();
  const { data, loading, error, reload, setData } = useRequest(() => adminApi.customer(id), [id]);
  const [editing, setEditing] = useState(false);
  const actions = useGiftActions({ onChanged: reload });

  if (error) {
    return (
      <div className="adm-page">
        <PageHeader back={{ to: "/admin/customers", label: "Clientes" }} title="Cliente" />
        <EmptyState icon="!" title="No pudimos cargar este cliente" text={error} action={<Button onClick={reload}>Reintentar</Button>} />
      </div>
    );
  }

  const createLink = `/admin/gifts/new?customerId=${id}`;

  return (
    <div className="adm-page">
      <PageHeader
        back={{ to: "/admin/customers", label: "Clientes" }}
        title={
          loading ? (
            <Skel w={220} h={30} />
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
              <span className="adm-avatar adm-avatar--lg">{initials(data.name)}</span>
              {data.name}
            </span>
          )
        }
        subtitle={data ? `Cliente desde ${formatDate(data.createdAt)} · ${plural(data.giftsCount, "regalo", "regalos")}` : " "}
        actions={
          data && (
            <>
              {data.phone && (
                <Button icon={<WhatsAppOutlined />} href={whatsappUrl("", data.phone)} target="_blank" rel="noreferrer">
                  WhatsApp
                </Button>
              )}
              <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Link to={createLink}>
                <Button type="primary" icon={<PlusOutlined />}>
                  Crear regalo
                </Button>
              </Link>
            </>
          )
        }
      />

      <div className="adm-cols">
        <section>
          <div className="adm-section__head">
            <h2 className="adm-section__title">Regalos</h2>
          </div>
          {loading ? (
            <GiftGridSkeleton count={2} />
          ) : data.gifts.length === 0 ? (
            <EmptyState
              title={`${data.name.split(" ")[0]} aún no tiene regalos`}
              text="Crea uno y podrás enviarle el link o pedirle sus fotos."
              action={
                <Link to={createLink}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    Crear regalo
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="adm-gift-grid">
              {data.gifts.map((gift) => (
                <GiftCard key={gift.id} gift={gift} actions={actions} showCustomer={false} />
              ))}
            </div>
          )}
        </section>

        <aside style={{ display: "grid", gap: 32, alignContent: "start" }}>
          <section>
            <div className="adm-section__head">
              <h2 className="adm-section__title">Perfil</h2>
            </div>
            <div className="adm-panel" style={{ padding: 18 }}>
              {loading ? (
                <Skel h={80} />
              ) : (
                <dl className="adm-kv">
                  <div>
                    <dt>WhatsApp</dt>
                    <dd>{data.phone || <span className="adm-muted">Sin número</span>}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>
                      {data.email ? (
                        <a href={`mailto:${data.email}`}>
                          <MailOutlined /> {data.email}
                        </a>
                      ) : (
                        <span className="adm-muted">Sin email</span>
                      )}
                    </dd>
                  </div>
                  {data.notes && (
                    <div>
                      <dt>Notas</dt>
                      <dd style={{ whiteSpace: "pre-wrap" }}>{data.notes}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </section>

          <section>
            <div className="adm-section__head">
              <h2 className="adm-section__title">Actividad</h2>
            </div>
            {loading ? (
              <Skel h={120} />
            ) : data.activity.length === 0 ? (
              <p className="adm-muted">Sin actividad todavía.</p>
            ) : (
              <ol className="adm-timeline">
                {data.activity.map((item, i) => (
                  <li key={i}>
                    <span>{item.text}</span>
                    <span className="adm-muted adm-small">{timeAgo(item.at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>

      <CustomerFormModal
        open={editing}
        customer={data}
        onClose={() => setEditing(false)}
        onSaved={(saved) => {
          setData((prev) => ({ ...prev, ...saved }));
          message.success("Cliente actualizado");
        }}
      />
      {actions.dialogs}
    </div>
  );
}
