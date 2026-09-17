import { useEffect, useRef, useState } from "react";
import { App, Button, Drawer, Input, InputNumber, Modal, Popconfirm, Switch, Tag } from "antd";
import { CheckOutlined, CloseOutlined, PaperClipOutlined } from "@ant-design/icons";
import { adminApi, errorDetails, errorMessage } from "../api.js";
import { giftTitle, money, templateName, whatsappUrl } from "../lib/gifts.js";
import { formatDate, timeAgo } from "../lib/format.js";
import { ReviewBadge } from "./ui.jsx";

/**
 * El referido envía su regalo a aprobación. Puede adjuntar el comprobante del Yape,
 * pero es opcional: muchos lo mandan por WhatsApp.
 */
export function SubmitDialog({ gift, open, onClose, onDone }) {
  const { message } = App.useApp();
  const [note, setNote] = useState("");
  const [salePrice, setSalePrice] = useState(null);
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setNote("");
      setFile(null);
      setSalePrice(gift?.salePrice ?? null);
    }
  }, [open, gift]);

  const submit = async () => {
    setSending(true);
    try {
      await adminApi.submitGift(gift.id, { note: note.trim() || undefined, salePrice: salePrice ?? "" });
      if (file) await adminApi.uploadPaymentProof(gift.id, file);
      message.success("Enviado. Te avisamos cuando esté aprobado.");
      onDone?.();
      onClose();
    } catch (err) {
      const details = errorDetails(err);
      message.error(details.length ? details[0].message : errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Enviar a aprobación"
      okText="Enviar"
      cancelText="Cancelar"
      confirmLoading={sending}
      onOk={submit}
      width={460}
    >
      <p className="adm-muted" style={{ marginTop: 0 }}>
        {gift?.price ? (
          <>
            Este regalo cuesta <strong>{money(gift.price, gift.currency)}</strong>. Yapea ese monto y envíalo a revisión: apenas
            se apruebe verás el link y el QR para tu cliente.
          </>
        ) : (
          <>Envíalo a revisión. Cuando se apruebe verás el link y el QR para tu cliente.</>
        )}
      </p>
      <label className="adm-field">
        <span className="adm-field__label">¿A cuánto se lo vendiste? (opcional)</span>
        <InputNumber
          size="large"
          style={{ width: "100%" }}
          min={0}
          step={1}
          prefix="S/"
          value={salePrice}
          onChange={setSalePrice}
          placeholder="Ej. 25"
        />
        <span className="adm-muted adm-small">Sólo para tus cuentas: así ves cuánto ganaste.</span>
      </label>
      <label className="adm-field">
        <span className="adm-field__label">Mensaje (opcional)</span>
        <Input.TextArea
          rows={3}
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. Yapeado hoy a las 3pm desde el 987654321"
        />
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button icon={<PaperClipOutlined />} onClick={() => inputRef.current?.click()}>
        {file ? file.name : "Adjuntar comprobante (opcional)"}
      </Button>
    </Modal>
  );
}

/** El vendedor revisa el pedido de su cliente final: ve el comprobante y lo acepta o rechaza. */
export function OrderDrawer({ gift, open, onClose, onChanged }) {
  const { message } = App.useApp();
  const [proof, setProof] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !gift) return;
    setNote("");
    setProof(null);
    if (gift.hasClientProof) adminApi.clientProof(gift.id).then(setProof).catch(() => {});
  }, [open, gift]);

  if (!gift) return null;

  const run = async (action, success) => {
    setBusy(true);
    try {
      const result = await adminApi.reviewOrder(gift.id, { action, note: note.trim() || undefined });
      message.success(success);
      onChanged?.(result);
      onClose();
    } catch (err) {
      message.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Pedido de tu cliente" width={440}>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <h3 style={{ margin: "0 0 4px" }}>{gift.requesterName || "Cliente"}</h3>
          <p className="adm-muted adm-small" style={{ margin: 0 }}>
            {templateName(gift.templateId)} · {gift.requesterPhone || "sin WhatsApp"} · pedido {timeAgo(gift.requestedAt)}
          </p>
          <div style={{ marginTop: 8 }}>
            <Tag color="blue">{money(gift.salePrice, gift.currency)}</Tag>
            {gift.hasClientProof ? <Tag color="green">Con comprobante</Tag> : <Tag>Sin comprobante</Tag>}
          </div>
        </div>

        <div>
          <span className="adm-field__label">Comprobante</span>
          {proof ? (
            <a href={proof.url} target="_blank" rel="noreferrer">
              <img src={proof.thumbUrl || proof.url} alt="Comprobante del cliente" className="adm-proof" />
            </a>
          ) : (
            <p className="adm-muted adm-small" style={{ margin: 0 }}>
              No adjuntó comprobante. Revisa tu Yape o escríbele por WhatsApp.
            </p>
          )}
        </div>

        <label className="adm-field">
          <span className="adm-field__label">Nota interna</span>
          <Input.TextArea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <Button type="primary" size="large" icon={<CheckOutlined />} loading={busy} onClick={() => run("accept", "Pedido aceptado")}>
            Aceptar pedido
          </Button>
          <Popconfirm
            title="¿Rechazar este pedido?"
            description="El regalo queda marcado como rechazado. Avísale a tu cliente por WhatsApp."
            okText="Rechazar"
            cancelText="Cancelar"
            onConfirm={() => run("reject", "Pedido rechazado")}
          >
            <Button danger size="large" icon={<CloseOutlined />} loading={busy}>
              Rechazar
            </Button>
          </Popconfirm>
          {gift.requesterPhone && (
            <Button href={whatsappUrl(`Hola ${gift.requesterName || ""} 👋 recibí tu pedido`, gift.requesterPhone)} target="_blank">
              Escribirle por WhatsApp
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}

/** Tú revisas: ves el comprobante, ajustas el precio y apruebas o rechazas. */
export function ReviewDrawer({ gift, open, onClose, onChanged }) {
  const { message } = App.useApp();
  const [price, setPrice] = useState(gift?.price ?? null);
  const [note, setNote] = useState("");
  const [proof, setProof] = useState(null);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !gift) return;
    setPrice(gift.price ?? null);
    setNote("");
    setProof(null);
    setPaid(Boolean(gift.paidAt));
    if (gift.hasPaymentProof) adminApi.paymentProof(gift.id).then(setProof).catch(() => {});
  }, [open, gift]);

  if (!gift) return null;

  const run = async (fn, success) => {
    setBusy(true);
    try {
      const result = await fn();
      message.success(success);
      onChanged?.(result);
      onClose();
    } catch (err) {
      const details = errorDetails(err);
      message.error(details.length ? `Falta completar: ${details[0].message}` : errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer open={open} onClose={onClose} title="Revisar regalo" width={440}>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <h3 style={{ margin: "0 0 4px" }}>{giftTitle(gift)}</h3>
          <p className="adm-muted adm-small" style={{ margin: 0 }}>
            {templateName(gift.templateId)} · {gift.createdBy?.name || "Tú"} · enviado {timeAgo(gift.submittedAt)}
          </p>
          <div style={{ marginTop: 8 }}>
            <ReviewBadge reviewStatus={gift.reviewStatus} />
            {gift.paidAt && <Tag color="green" style={{ marginLeft: 6 }}>Pagado {formatDate(gift.paidAt)}</Tag>}
          </div>
        </div>

        {gift.reviewNote && (
          <div className="adm-note">
            <span className="adm-field__label">Mensaje del referido</span>
            <p style={{ margin: 0 }}>{gift.reviewNote}</p>
          </div>
        )}

        <div>
          <span className="adm-field__label">Comprobante</span>
          {proof ? (
            <a href={proof.url} target="_blank" rel="noreferrer">
              <img src={proof.thumbUrl || proof.url} alt="Comprobante de pago" className="adm-proof" />
            </a>
          ) : (
            <p className="adm-muted adm-small" style={{ margin: 0 }}>
              No adjuntó comprobante. Revisa tu Yape o WhatsApp.
            </p>
          )}
        </div>

        <label className="adm-field">
          <span className="adm-field__label">Te debe pagar</span>
          <InputNumber
            size="large"
            style={{ width: "100%" }}
            min={0}
            step={1}
            prefix="S/"
            value={price}
            onChange={setPrice}
            placeholder="Precio de la plantilla"
          />
        </label>

        <label className="adm-pay-toggle">
          <Switch checked={paid} onChange={setPaid} />
          <span>
            Ya me pagó
            <span className="adm-muted adm-small" style={{ display: "block" }}>
              Actívalo si ya recibiste el Yape: se registra al aprobar.
            </span>
          </span>
        </label>

        <label className="adm-field">
          <span className="adm-field__label">Nota (la ve el referido)</span>
          <Input.TextArea rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <Button
            type="primary"
            size="large"
            icon={<CheckOutlined />}
            loading={busy}
            onClick={() =>
              run(
                () => adminApi.reviewGift(gift.id, { action: "approve", price, paid, note: note.trim() || undefined }),
                paid ? "Aprobado, publicado y pago registrado" : "Aprobado y publicado"
              )
            }
          >
            Aprobar y publicar
          </Button>
          <Popconfirm
            title="¿Rechazar este regalo?"
            description="El referido verá tu nota y podrá volver a enviarlo."
            okText="Rechazar"
            cancelText="Cancelar"
            onConfirm={() => run(() => adminApi.reviewGift(gift.id, { action: "reject", note: note.trim() || undefined }), "Regalo rechazado")}
          >
            <Button danger size="large" icon={<CloseOutlined />} loading={busy}>
              Rechazar
            </Button>
          </Popconfirm>
          {gift.reviewStatus === "approved" && (
            <Button
              loading={busy}
              onClick={() => run(() => adminApi.setGiftPaid(gift.id, !gift.paidAt), gift.paidAt ? "Marcado como no pagado" : "Marcado como pagado")}
            >
              {gift.paidAt ? "Quitar el pagado" : "Marcar como pagado"}
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
