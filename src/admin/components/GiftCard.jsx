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
} from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { giftTitle, giftUrl, templateName } from "../lib/gifts.js";
import { timeAgo } from "../lib/format.js";
import { StatusBadge, TemplateThumb } from "./ui.jsx";
import ShareDialog, { copyText } from "./ShareDialog.jsx";

/** Acciones de un regalo (menú de tarjeta o del editor). */
export function useGiftActions({ onChanged } = {}) {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [share, setShare] = useState(null);

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
    return [
      { key: "edit", icon: <EditOutlined />, label: "Editar", onClick: () => navigate(`/admin/gifts/${gift.id}`) },
      { key: "preview", icon: <EyeOutlined />, label: "Preview", onClick: () => navigate(`/admin/gifts/${gift.id}/preview`) },
      {
        key: "copy",
        icon: <CopyOutlined />,
        label: published ? "Copiar link" : "Copiar link (publícalo primero)",
        disabled: !published,
        onClick: async () => ((await copyText(giftUrl(gift.slug))) ? message.success("Link copiado") : message.error("No se pudo copiar")),
      },
      { key: "qr", icon: <QrcodeOutlined />, label: "QR y compartir", disabled: !published, onClick: () => setShare(gift) },
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
    </>
  );

  return { menuFor, dialogs, openShare: setShare };
}

export default function GiftCard({ gift, actions, showCustomer = true }) {
  return (
    <article className="adm-gift-card">
      <Link to={`/admin/gifts/${gift.id}`} className="adm-gift-card__media" aria-label={`Editar regalo ${giftTitle(gift)}`}>
        <TemplateThumb templateId={gift.templateId} />
        <span className="adm-gift-card__status">
          <StatusBadge status={gift.status} />
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
          <span className="adm-gift-card__meta">Editado {timeAgo(gift.updatedAt)}</span>
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
