import { useEffect, useRef, useState } from "react";
import { App, Button, Drawer, Input, InputNumber, Modal, Popconfirm, Tag } from "antd";
import { CheckOutlined, CloseOutlined, PaperClipOutlined } from "@ant-design/icons";
import { adminApi, errorDetails, errorMessage } from "../api.js";
import { giftTitle, money, templateName } from "../lib/gifts.js";
import { formatDate, timeAgo } from "../lib/format.js";
import { ReviewBadge } from "./ui.jsx";

/**
 * El referido envía su regalo a aprobación. Puede adjuntar el comprobante del Yape,
 * pero es opcional: muchos lo mandan por WhatsApp.
 */
export function SubmitDialog({ gift, open, onClose, onDone }) {
  const { message } = App.useApp();
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setNote("");
      setFile(null);
    }
  }, [open]);

  const submit = async () => {
    setSending(true);
    try {
      await adminApi.submitGift(gift.id, { note: note.trim() || undefined });
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

/** Tú revisas: ves el comprobante, ajustas el precio y apruebas o rechazas. */
export function ReviewDrawer({ gift, open, onClose, onChanged }) {
  const { message } = App.useApp();
  const [price, setPrice] = useState(gift?.price ?? null);
  const [note, setNote] = useState("");
  const [proof, setProof] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !gift) return;
    setPrice(gift.price ?? null);
    setNote("");
    setProof(null);
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
            onClick={() => run(() => adminApi.reviewGift(gift.id, { action: "approve", price, note: note.trim() || undefined }), "Aprobado y publicado")}
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
