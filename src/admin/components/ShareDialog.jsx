import { useRef } from "react";
import { App, Button, Modal } from "antd";
import { CopyOutlined, DownloadOutlined, ExportOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { QRCodeCanvas } from "qrcode.react";
import { giftUrl, whatsappUrl } from "../lib/gifts.js";

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Safari antiguo / http: método alternativo
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

/** Link + QR descargable + WhatsApp para un regalo publicado. */
export default function ShareDialog({ gift, open, onClose, justPublished = false }) {
  const { message } = App.useApp();
  const qrWrap = useRef(null);
  if (!gift) return null;
  const url = giftUrl(gift.slug);
  const who = gift.recipientName || "ti";
  const waText = `Tengo una sorpresa para ${who} 💛 Ábrela aquí: ${url}`;

  const downloadQr = () => {
    const canvas = qrWrap.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `regalo-${gift.recipientName ? gift.recipientName.toLowerCase().replace(/\s+/g, "-") : gift.slug}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={420} title={justPublished ? "¡Regalo publicado!" : "Compartir regalo"} destroyOnHidden>
      <div className="adm-share">
        {justPublished && <p className="adm-muted" style={{ margin: 0 }}>Ya puedes enviarlo. El link y el QR abren la experiencia.</p>}
        <div className="adm-share__qr" ref={qrWrap}>
          <QRCodeCanvas value={url} size={720} level="M" marginSize={2} />
          <Button icon={<DownloadOutlined />} onClick={downloadQr}>
            Descargar QR
          </Button>
        </div>
        <div className="adm-share__link">
          <code title={url}>{url.replace(/^https?:\/\//, "")}</code>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={async () => ((await copyText(url)) ? message.success("Link copiado") : message.error("No se pudo copiar"))}
          >
            Copiar
          </Button>
        </div>
        <div className="adm-share__buttons">
          <Button icon={<WhatsAppOutlined />} href={whatsappUrl(waText, gift.customer?.phone)} target="_blank" rel="noreferrer">
            {gift.customer?.phone ? "Al cliente" : "WhatsApp"}
          </Button>
          <Button icon={<ExportOutlined />} href={url} target="_blank" rel="noreferrer">
            Abrir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
