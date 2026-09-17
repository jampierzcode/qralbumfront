import { useState } from "react";
import { Link } from "react-router-dom";
import { App, Button, Drawer, Form, Input, Modal, Switch, Tag } from "antd";
import { CheckOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { money } from "../lib/gifts.js";
import { formatDate, initials, plural } from "../lib/format.js";
import { EmptyState, PageHeader } from "../components/ui.jsx";
import { PageSkeleton } from "../components/Skeletons.jsx";

/** Cuentas que venden tus regalos y te pagan por cada uno. */
export default function ReferralsPage() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRequest(() => adminApi.referrals(), []);
  const [creating, setCreating] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form] = Form.useForm();

  const items = data?.items || [];
  const totalOwed = items.reduce((sum, r) => sum + r.owed, 0);
  const totalPending = items.reduce((sum, r) => sum + r.pending, 0);

  const create = async (values) => {
    try {
      await adminApi.createReferral(values);
      message.success("Referido creado. Pásale su correo y contraseña.");
      setCreating(false);
      form.resetFields();
      reload();
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  if (loading && !data) return <PageSkeleton />;

  return (
    <div className="adm-page">
      <PageHeader
        title="Referidos"
        subtitle={
          items.length
            ? `${plural(items.length, "referido", "referidos")} · te deben ${money(totalOwed)}${totalPending ? ` · ${totalPending} por aprobar` : ""}`
            : "Personas que venden tus regalos"
        }
        actions={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            Nuevo referido
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<UserOutlined />}
          title="Todavía no tienes referidos"
          text="Crea una cuenta para quien quiera vender tus regalos. Podrá armarlos, pero el link recién aparece cuando tú apruebas."
          action={<Button type="primary" onClick={() => setCreating(true)}>Nuevo referido</Button>}
        />
      ) : (
        <div className="adm-rows">
          {items.map((r) => (
            <button key={r.id} type="button" className="adm-row adm-row--button" onClick={() => setDetail(r)}>
              <span className="adm-avatar">{initials(r.name)}</span>
              <div className="adm-row__main">
                <span className="adm-row__title">
                  {r.name} {!r.isActive && <Tag>Desactivado</Tag>}
                </span>
                <span className="adm-row__meta">
                  {r.email}
                  {r.phone ? ` · ${r.phone}` : ""}
                </span>
                <span className="adm-row__meta">
                  {plural(r.gifts, "regalo", "regalos")} · {plural(r.approved, "aprobado", "aprobados")}
                  {r.pending ? ` · ${r.pending} por aprobar` : ""}
                </span>
              </div>
              <div className="adm-row__side">
                <span className={`adm-status adm-status--${r.owed > 0 ? "amber" : "green"}`}>
                  {r.owed > 0 ? `Debe ${money(r.owed)}` : "Sin deuda"}
                </span>
                <span className="adm-muted adm-small">Pagó {money(r.paid)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <Modal open={creating} onCancel={() => setCreating(false)} title="Nuevo referido" okText="Crear" cancelText="Cancelar" onOk={form.submit}>
        <Form form={form} layout="vertical" onFinish={create} requiredMark={false}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: "Escribe su nombre" }]}>
            <Input size="large" placeholder="Ana Torres" />
          </Form.Item>
          <Form.Item name="email" label="Correo (con esto entra)" rules={[{ required: true, type: "email", message: "Correo inválido" }]}>
            <Input size="large" placeholder="ana@correo.com" />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 8, message: "Mínimo 8 caracteres" }]}>
            <Input size="large" placeholder="Mínimo 8 caracteres" />
          </Form.Item>
          <Form.Item name="phone" label="WhatsApp (opcional)">
            <Input size="large" placeholder="987654321" />
          </Form.Item>
        </Form>
      </Modal>

      <ReferralDrawer referral={detail} onClose={() => setDetail(null)} onChanged={reload} />
    </div>
  );
}

function ReferralDrawer({ referral, onClose, onChanged }) {
  const { message } = App.useApp();
  const [password, setPassword] = useState("");
  const account = useRequest(() => (referral ? adminApi.referralAccount(referral.id) : Promise.resolve(null)), [referral?.id]);

  if (!referral) return null;

  const update = async (body, success) => {
    try {
      await adminApi.updateReferral(referral.id, body);
      message.success(success);
      onChanged?.();
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  const summary = account.data?.summary;
  const unpaid = account.data?.unpaidGifts || [];

  // Registrar el pago = marcar los regalos que ya te yapeó.
  const markPaid = async (ids, success) => {
    try {
      await Promise.all(ids.map((id) => adminApi.setGiftPaid(id, true)));
      message.success(success);
      account.reload();
      onChanged?.();
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  return (
    <Drawer open={Boolean(referral)} onClose={onClose} title={referral.name} width={440}>
      <div style={{ display: "grid", gap: 20 }}>
        <div className="adm-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="adm-stat">
            <span className="adm-stat__label">Te debe</span>
            <span className="adm-stat__value">{money(summary?.owed ?? referral.owed)}</span>
          </div>
          <div className="adm-stat">
            <span className="adm-stat__label">Ya pagó</span>
            <span className="adm-stat__value">{money(summary?.paid ?? referral.paid)}</span>
          </div>
          <div className="adm-stat">
            <span className="adm-stat__label">Por aprobar</span>
            <span className="adm-stat__value">{summary?.pending ?? referral.pending}</span>
          </div>
        </div>

        <label className="adm-field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Switch checked={referral.isActive} onChange={(v) => update({ isActive: v }, v ? "Cuenta activada" : "Cuenta desactivada")} />
          <span>Puede entrar al panel</span>
        </label>

        <div className="adm-field">
          <span className="adm-field__label">Cambiar su contraseña</span>
          <Input.Search
            size="large"
            enterButton="Cambiar"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onSearch={(value) => value.length >= 8 ? update({ password: value }, "Contraseña actualizada").then(() => setPassword("")) : message.error("Mínimo 8 caracteres")}
          />
        </div>

        <GiftList title="Pendientes de tu aprobación" items={account.data?.pendingGifts} empty="Nada por aprobar." />

        <div>
          <div className="adm-list-head">
            <span className="adm-field__label" style={{ margin: 0 }}>Aprobados sin pagar</span>
            {unpaid.length > 1 && (
              <Button size="small" icon={<CheckOutlined />} onClick={() => markPaid(unpaid.map((g) => g.id), "Todo marcado como pagado")}>
                Ya me pagó todo
              </Button>
            )}
          </div>
          {unpaid.length === 0 ? (
            <p className="adm-muted adm-small" style={{ margin: 0 }}>No te debe nada.</p>
          ) : (
            <div className="adm-rows">
              {unpaid.map((g) => (
                <div key={g.id} className="adm-row">
                  <div className="adm-row__main">
                    <Link to={`/admin/gifts/${g.id}`} className="adm-row__title">
                      {g.recipientName || "Sin destinatario"}
                    </Link>
                    <span className="adm-row__meta">
                      {money(g.price, g.currency)} · aprobado {formatDate(g.reviewedAt || g.submittedAt)}
                    </span>
                  </div>
                  <div className="adm-row__side">
                    <Button size="small" icon={<CheckOutlined />} onClick={() => markPaid([g.id], "Pago registrado")}>
                      Ya me pagó
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function GiftList({ title, items = [], empty, showPrice = false }) {
  return (
    <div>
      <span className="adm-field__label">{title}</span>
      {items.length === 0 ? (
        <p className="adm-muted adm-small" style={{ margin: 0 }}>{empty}</p>
      ) : (
        <div className="adm-rows">
          {items.map((g) => (
            <a key={g.id} href={`/admin/gifts/${g.id}`} className="adm-row">
              <div className="adm-row__main">
                <span className="adm-row__title">{g.recipientName || "Sin destinatario"}</span>
                <span className="adm-row__meta">
                  {showPrice ? `${money(g.price, g.currency)} · ` : ""}
                  {formatDate(g.submittedAt || g.reviewedAt)}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
