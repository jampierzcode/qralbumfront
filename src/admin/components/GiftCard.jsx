import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App, Button, Dropdown } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  SnippetsOutlined,
  MoreOutlined,
  QrcodeOutlined,
  RollbackOutlined,
  SendOutlined,
  SolutionOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import ContentRequestDialog from "./ContentRequestDialog.jsx";
import { SubmitDialog, ReviewDrawer } from "./ReviewFlow.jsx";
import { useIsReferral } from "../auth.jsx";
import { adminApi, errorMessage } from "../api.js";
import { giftTitle, giftUrl, money, templateName } from "../lib/gifts.js";
import { timeAgo } from "../lib/format.js";
import { ReviewBadge, StatusBadge, TemplateThumb } from "./ui.jsx";
import ShareDialog, { copyText } from "./ShareDialog.jsx";

/** Acciones de un regalo (menú de tarjeta o del editor). */
export function useGiftActions({ onChanged } = {}) {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [share, setShare] = useState(null);
  const [request, setRequest] = useState(null);
  const [submit, setSubmit] = useState(null);
  const [review, setReview] = useState(null);
  const isReferral = useIsReferral();

  const run = async (fn, success) => {
    try {
      const result = await fn();
      if (success) message.success(success);
      onChanged?.(result);
      return result;
    } catch (err) {
      message.error(errorMessage(err));
      return null;
    }
  };

  const menuFor = (gift) => {
    const published = gift.status === "published";
    const archived = gift.status === "archived";
    // Sin aprobación no hay link ni QR para el referido.
    const shareable = published && gift.canShare !== false;
    const pending = gift.reviewStatus === "pending";
    return [
      ...(isReferral && !shareable
        ? [{
            key: "submit",
            icon: <SendOutlined />,
            label: pending ? "Esperando aprobación" : "Enviar a aprobación",
            disabled: pending || archived,
            onClick: () => setSubmit(gift),
          }]
        : []),
      ...(!isReferral && pending
        ? [{ key: "review", icon: <SolutionOutlined />, label: "Revisar y aprobar", onClick: () => setReview(gift) }]
        : []),
      // Registrar el pago del referido sin salir del regalo.
      ...(!isReferral && gift.reviewStatus === "approved"
        ? [{
            key: "paid",
            icon: <DollarOutlined />,
            label: gift.paidAt ? "Quitar el pagado" : "Marcar como pagado",
            onClick: () => run(() => adminApi.setGiftPaid(gift.id, !gift.paidAt), gift.paidAt ? "Marcado como no pagado" : "Pago registrado"),
          }]
        : []),
      { key: "edit", icon: <EditOutlined />, label: "Editar", onClick: () => navigate(`/admin/gifts/${gift.id}`) },
      { key: "preview", icon: <EyeOutlined />, label: "Preview", onClick: () => navigate(`/admin/gifts/${gift.id}/preview`) },
      {
        key: "copy",
        icon: <CopyOutlined />,
        label: shareable ? "Copiar link" : isReferral ? "Copiar link (falta aprobación)" : "Copiar link (publícalo primero)",
        disabled: !shareable,
        onClick: async () => ((await copyText(giftUrl(gift.slug))) ? message.success("Link copiado") : message.error("No se pudo copiar")),
      },
      { key: "qr", icon: <QrcodeOutlined />, label: "QR y compartir", disabled: !shareable, onClick: () => setShare(gift) },
      { key: "request", icon: <SendOutlined />, label: "Solicitar contenido", disabled: archived, onClick: () => setRequest(gift) },
      { type: "divider" },
      {
        key: "duplicate",
        icon: <SnippetsOutlined />,
        label: "Duplicar",
        onClick: () =>
          run(() => adminApi.duplicateGift(gift.id), "Regalo duplicado").then((copy) => copy && navigate(`/admin/gifts/${copy.id}`)),
      },
      archived
        ? { key: "restore", icon: <RollbackOutlined />, label: "Restaurar como borrador", onClick: () => run(() => adminApi.setGiftStatus(gift.id, "draft"), "Regalo restaurado") }
        : {
            key: "archive",
            icon: <DeleteOutlined />,
            label: "Archivar",
            danger: true,
            onClick: () =>
              modal.confirm({
                title: "¿Archivar este regalo?",
                content: published ? "El link dejará de funcionar para quien lo recibió. Puedes restaurarlo después." : "Podrás restaurarlo desde el filtro Archivados.",
                okText: "Archivar",
                okButtonProps: { danger: true },
                cancelText: "Cancelar",
                onOk: () => run(() => adminApi.setGiftStatus(gift.id, "archived"), "Regalo archivado"),
              }),
          },
    ];
  };

  const dialogs = (
    <>
      <ShareDialog gift={share} open={Boolean(share)} onClose={() => setShare(null)} />
      <SubmitDialog gift={submit} open={Boolean(submit)} onClose={() => setSubmit(null)} onDone={() => onChanged?.({ id: submit?.id, reviewStatus: "pending" })} />
      <ReviewDrawer gift={review} open={Boolean(review)} onClose={() => setReview(null)} onChanged={(g) => onChanged?.(g)} />
      <ContentRequestDialog gift={request} open={Boolean(request)} onClose={() => setRequest(null)} onChanged={() => onChanged?.({ id: request?.id, status: "collecting_content" })} />
    </>
  );

  return { menuFor, dialogs, openShare: setShare, openRequest: setRequest };
}

/** Cuánto cuesta el regalo, a cuánto se vendió y cuánto queda de ganancia. */
export function GiftMoney({ gift }) {
  if (gift.price === null && gift.salePrice === null) return null;
  const profit = gift.salePrice !== null && gift.price !== null ? gift.salePrice - gift.price : null;
  return (
    <span className="adm-gift-card__money">
      {gift.price !== null && <span>Te cuesta {money(gift.price, gift.currency)}</span>}
      {gift.salePrice !== null && <span>Lo vendiste en {money(gift.salePrice, gift.currency)}</span>}
      {profit !== null && <strong>Ganas {money(profit, gift.currency)}</strong>}
    </span>
  );
}

export default function GiftCard({ gift, actions, showCustomer = true }) {
  return (
    <article className="adm-gift-card">
      <Link to={`/admin/gifts/${gift.id}`} className="adm-gift-card__media" aria-label={`Editar regalo ${giftTitle(gift)}`}>
        <TemplateThumb templateId={gift.templateId} />
        <span className="adm-gift-card__status">
          <StatusBadge status={gift.status} />
          <ReviewBadge reviewStatus={gift.reviewStatus} />
        </span>
      </Link>
      <div className="adm-gift-card__body">
        <div className="adm-gift-card__text">
          <Link to={`/admin/gifts/${gift.id}`} className="adm-gift-card__title">
            {giftTitle(gift)}
          </Link>
          <span className="adm-gift-card__meta">
            {[showCustomer && gift.customer?.name, templateName(gift.templateId)].filter(Boolean).join(" · ")}
          </span>
          <span className="adm-gift-card__meta">
            {gift.createdBy ? `${gift.createdBy.name} · ` : ""}Editado {timeAgo(gift.updatedAt)}
          </span>
          <GiftMoney gift={gift} />
        </div>
        {actions && (
          <Dropdown trigger={["click"]} menu={{ items: actions.menuFor(gift) }} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} aria-label="Acciones" />
          </Dropdown>
        )}
      </div>
    </article>
  );
}
