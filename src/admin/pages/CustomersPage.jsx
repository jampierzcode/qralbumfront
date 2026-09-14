import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App, Button, Input } from "antd";
import { PlusOutlined, SearchOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { adminApi } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { formatDate, initials, plural, timeAgo } from "../lib/format.js";
import { whatsappUrl } from "../lib/gifts.js";
import { EmptyState, PageHeader } from "../components/ui.jsx";
import { RowsSkeleton } from "../components/Skeletons.jsx";
import { CustomerFormModal } from "../components/customers.jsx";

export default function CustomersPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useRequest(() => adminApi.customers(), []);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const items = useMemo(() => {
    const list = data?.items || [];
    const q = search.trim().toLowerCase();
    return q ? list.filter((c) => `${c.name} ${c.phone || ""} ${c.email || ""}`.toLowerCase().includes(q)) : list;
  }, [data, search]);

  return (
    <div className="adm-page">
      <PageHeader
        title="Clientes"
        subtitle={data ? plural(data.items.length, "cliente", "clientes") : " "}
        actions={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            Nuevo cliente
          </Button>
        }
      />

      <div className="adm-toolbar">
        <Input
          className="adm-toolbar__search"
          size="large"
          allowClear
          prefix={<SearchOutlined className="adm-muted" />}
          placeholder="Buscar por nombre, WhatsApp o email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error ? (
        <EmptyState icon="!" title="No pudimos cargar los clientes" text={error} action={<Button onClick={reload}>Reintentar</Button>} />
      ) : loading ? (
        <RowsSkeleton />
      ) : items.length === 0 ? (
        search ? (
          <EmptyState icon="⌕" title="Sin resultados" text={`No hay clientes que coincidan con "${search}".`} />
        ) : (
          <EmptyState
            title="Aún no tienes clientes"
            text="Guarda a quien te compra por TikTok, Instagram o WhatsApp para tener sus regalos a mano."
            action={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
                Nuevo cliente
              </Button>
            }
          />
        )
      ) : (
        <div className="adm-rows">
          {items.map((c) => (
            <Link key={c.id} to={`/admin/customers/${c.id}`} className="adm-row">
              <span className="adm-avatar">{initials(c.name)}</span>
              <div className="adm-row__main">
                <span className="adm-row__title">{c.name}</span>
                <span className="adm-row__meta">
                  {[c.phone, c.email].filter(Boolean).join(" · ") || "Sin contacto"}
                </span>
              </div>
              <div className="adm-row__side" style={{ textAlign: "right" }}>
                <div style={{ display: "grid", gap: 2 }}>
                  <span style={{ color: "var(--adm-text)", fontWeight: 550 }}>{plural(c.giftsCount || 0, "regalo", "regalos")}</span>
                  <span>{c.lastGiftAt ? `Último ${timeAgo(c.lastGiftAt)}` : `Desde ${formatDate(c.createdAt)}`}</span>
                </div>
                {c.phone && (
                  <Button
                    type="text"
                    icon={<WhatsAppOutlined />}
                    aria-label={`WhatsApp de ${c.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(whatsappUrl("", c.phone), "_blank", "noopener");
                    }}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <CustomerFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(created) => {
          message.success("Cliente creado");
          navigate(`/admin/customers/${created.id}`);
        }}
      />
    </div>
  );
}
