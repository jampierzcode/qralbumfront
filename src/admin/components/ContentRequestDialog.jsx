import { useEffect, useMemo, useState } from "react";
import { App, Button, Checkbox, Modal, Select, Skeleton } from "antd";
import { CopyOutlined, StopOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { getCustomerEditableKeys } from "../../../gift-core/index.js";
import { getTemplate } from "../../engine/registry.js";
import { adminApi, errorMessage } from "../api.js";
import { formatDate, timeAgo } from "../lib/format.js";
import { uploadUrl, whatsappUrl } from "../lib/gifts.js";
import { copyText } from "./ShareDialog.jsx";

const EXPIRATION = [
  { value: 2, label: "2 días" },
  { value: 7, label: "7 días" },
  { value: 14, label: "14 días" },
  { value: 30, label: "30 días" },
];

const STATUS_TEXT = {
  active: "Activo",
  submitted: "El cliente ya envió su contenido",
  expired: "Vencido",
  revoked: "Desactivado",
};

/** "Solicitar contenido": genera un link privado para que el comprador complete el regalo. */
export default function ContentRequestDialog({ gift, open, onClose, onChanged }) {
  const { message } = App.useApp();
  const template = gift ? getTemplate(gift.templateId) : null;
  const editable = useMemo(() => (template ? getCustomerEditableKeys(template.schema) : []), [template]);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [fields, setFields] = useState([]);
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !gift) return;
    setFields(editable);
    setLoading(true);
    adminApi
      .contentRequests(gift.id)
      .then((res) => setRequests(res.items))
      .catch((err) => message.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [open, gift, editable, message]);

  if (!gift) return null;

  const current = requests.find((r) => r.status === "active" || r.status === "submitted");
  const link = current?.token ? uploadUrl(current.token) : null;
  const firstName = gift.customer?.name?.split(" ")[0];
  const waText = `Hola${firstName ? ` ${firstName}` : ""} 💛 Para preparar la sorpresa${gift.recipientName ? ` para ${gift.recipientName}` : ""} necesito que completes esto (fotos, mensaje y canción). Te toma 2 minutos: ${link}`;

  const create = async () => {
    setBusy(true);
    try {
      const created = await adminApi.createContentRequest(gift.id, { allowedFields: fields, expiresInDays: days });
      setRequests((prev) => [created, ...prev.map((r) => (r.status === "active" ? { ...r, status: "revoked", token: null } : r))]);
      await copyText(uploadUrl(created.token));
      message.success("Link creado y copiado");
      onChanged?.();
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    setBusy(true);
    try {
      const updated = await adminApi.revokeContentRequest(current.id);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      message.success("Link desactivado");
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const labelOf = (key) => template?.schema.fields[key]?.label || key;
  const blocked = gift.status === "published" || gift.status === "archived";

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={480} title="Solicitar contenido al cliente" destroyOnHidden>
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          <p className="adm-muted" style={{ margin: 0 }}>
            Envíale un link privado para que suba sus fotos y complete los datos desde su celular. No necesita crear cuenta y no verá precios ni otros regalos.
          </p>

          {current && (
            <div className="adm-panel" style={{ padding: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <strong>{STATUS_TEXT[current.status]}</strong>
                <span className="adm-muted adm-small">
                  {current.status === "submitted" ? `Enviado ${timeAgo(current.submittedAt)}` : `Vence el ${formatDate(current.expiresAt)}`}
                </span>
              </div>
              {link && current.status === "active" && (
                <>
                  <div className="adm-share__link">
                    <code title={link}>{link.replace(/^https?:\/\//, "")}</code>
                    <Button type="primary" icon={<CopyOutlined />} onClick={async () => ((await copyText(link)) ? message.success("Link copiado") : message.error("No se pudo copiar"))}>
                      Copiar
                    </Button>
                  </div>
                  <div className="adm-share__buttons">
                    <Button icon={<WhatsAppOutlined />} href={whatsappUrl(waText, gift.customer?.phone)} target="_blank" rel="noreferrer">
                      {gift.customer?.phone ? "Enviar al cliente" : "WhatsApp"}
                    </Button>
                    <Button icon={<StopOutlined />} danger onClick={revoke} loading={busy}>
                      Desactivar
                    </Button>
                  </div>
                  <p className="adm-muted adm-small" style={{ margin: 0 }}>
                    {current.lastUsedAt ? `Abierto por última vez ${timeAgo(current.lastUsedAt)}` : "Aún no lo ha abierto"} · Pide: {current.allowedFields.map(labelOf).join(", ")}
                  </p>
                </>
              )}
            </div>
          )}

          {blocked ? (
            <p style={{ margin: 0 }}>{gift.status === "published" ? "El regalo ya está publicado. Pásalo a borrador si necesitas pedir más contenido." : "El regalo está archivado."}</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <strong>{current?.status === "active" ? "Crear un link nuevo (desactiva el actual)" : "Crear link"}</strong>
              <div>
                <p className="adm-muted adm-small" style={{ margin: "0 0 8px" }}>
                  ¿Qué completará el cliente?
                </p>
                <Checkbox.Group
                  value={fields}
                  onChange={setFields}
                  style={{ display: "grid", gap: 6 }}
                  options={editable.map((key) => ({ value: key, label: labelOf(key) }))}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="adm-muted adm-small">Vence en</span>
                <Select value={days} onChange={setDays} options={EXPIRATION} style={{ width: 120 }} />
              </div>
              <Button type="primary" size="large" onClick={create} loading={busy} disabled={!fields.length}>
                {current?.status === "active" ? "Generar link nuevo" : "Generar y copiar link"}
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
