import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined, ExportOutlined } from "@ant-design/icons";
import { useGiftEditor } from "../hooks/useGiftEditor.js";
import { giftTitle, giftUrl } from "../lib/gifts.js";
import { EmptyState, StatusBadge } from "../components/ui.jsx";
import { PageSkeleton } from "../components/Skeletons.jsx";
import DevicePreview from "../components/DevicePreview.jsx";

/** Preview a pantalla completa en todos los tamaños soportados. */
export default function GiftPreviewPage() {
  const { id } = useParams();
  const editor = useGiftEditor(id);
  const [device, setDevice] = useState("mobile");

  if (editor.loadError) {
    return (
      <div className="adm-root adm-page">
        <EmptyState icon="!" title="No pudimos abrir el regalo" text={editor.loadError.message} />
      </div>
    );
  }
  if (!editor.gift || !editor.values) return <PageSkeleton />;

  return (
    <div className="adm-root adm-editor">
      <header className="adm-editor__top">
        <Link to={`/admin/gifts/${id}`} className="adm-editor__back">
          <ArrowLeftOutlined /> <span>Editor</span>
        </Link>
        <div className="adm-editor__title">
          <strong>{giftTitle(editor.gift)}</strong>
          <StatusBadge status={editor.gift.status} />
        </div>
        {editor.gift.status === "published" && (
          <Button icon={<ExportOutlined />} href={giftUrl(editor.gift.slug)} target="_blank" rel="noreferrer">
            Abrir link público
          </Button>
        )}
      </header>
      <div style={{ minHeight: 0, padding: 16 }}>
        <DevicePreview
          gift={editor.previewGift}
          media={editor.media.assets}
          device={device}
          onDeviceChange={setDevice}
          devices={["mobile-sm", "mobile", "mobile-land", "tablet", "desktop"]}
          defaultAutoOpen={false}
        />
      </div>
    </div>
  );
}
