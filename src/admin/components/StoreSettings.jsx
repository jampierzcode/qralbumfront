import { useEffect, useState } from "react";
import { App, Button, Input, Popconfirm, QRCode, Switch } from "antd";
import { CopyOutlined, ReloadOutlined, WhatsAppOutlined } from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { storeUrl, whatsappUrl } from "../lib/gifts.js";
import { copyText } from "./ShareDialog.jsx";

/** Tu link público: los clientes finales piden su regalo desde ahí. */
export default function StoreSettings() {
  const { message } = App.useApp();
  const { data, loading, setData } = useRequest(() => adminApi.store(), []);
  const [publicName, setPublicName] = useState("");
  const [publicMessage, setPublicMessage] = useState("");

  useEffect(() => {
    if (!data) return;
    setPublicName(data.publicName || "");
    setPublicMessage(data.publicMessage || "");
  }, [data]);

  if (loading && !data) return null;

  const save = async (body, success) => {
    try {
      setData(await adminApi.updateStore(body));
      if (success) message.success(success);
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  const url = storeUrl(data.handle);

  return (
    <section className="adm-section">
      <div className="adm-list-head">
        <div>
          <h2 className="adm-section-title" style={{ marginBottom: 2 }}>Mi link de pedidos</h2>
          <p className="adm-muted adm-small" style={{ margin: 0 }}>
            Compártelo en tus historias: tus clientes eligen su regalo, suben sus fotos y te pagan, sin que tú escribas nada.
          </p>
        </div>
        <Switch
          checked={data.ordersEnabled}
          onChange={(v) => save({ ordersEnabled: v }, v ? "Link activado" : "Link desactivado")}
        />
      </div>

      {data.ordersEnabled ? (
        <div className="adm-store-link">
          <div className="adm-store-link__qr">
            <QRCode value={url} size={104} bordered={false} errorLevel="M" />
          </div>
          <div className="adm-store-link__main">
            <code className="adm-link-box">{url}</code>
            <div className="adm-actions" style={{ marginTop: 8 }}>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={async () => ((await copyText(url)) ? message.success("Link copiado") : message.error("No se pudo copiar"))}
              >
                Copiar link
              </Button>
              <Button icon={<WhatsAppOutlined />} href={whatsappUrl(`Pide tu regalo digital aquí 💛\n${url}`)} target="_blank">
                Compartir
              </Button>
              <Button href={url} target="_blank">
                Ver cómo se ve
              </Button>
              <Popconfirm
                title="¿Generar un link nuevo?"
                description="El link anterior dejará de abrir. Úsalo si se te filtró o quieres empezar de cero."
                okText="Generar"
                cancelText="Cancelar"
                onConfirm={() => save({ regenerate: true }, "Link nuevo generado")}
              >
                <Button icon={<ReloadOutlined />} aria-label="Generar un link nuevo" />
              </Popconfirm>
            </div>
          </div>
        </div>
      ) : (
        <p className="adm-muted adm-small">Actívalo cuando tengas tus precios y tus datos de pago listos.</p>
      )}

      <div className="adm-field" style={{ marginTop: 16 }}>
        <span className="adm-field__label">Nombre que verán tus clientes</span>
        <Input
          size="large"
          value={publicName}
          maxLength={120}
          placeholder="Detalles de Ana"
          onChange={(e) => setPublicName(e.target.value)}
          onBlur={() => publicName !== (data.publicName || "") && save({ publicName })}
        />
      </div>
      <div className="adm-field">
        <span className="adm-field__label">Mensaje de bienvenida</span>
        <Input.TextArea
          rows={2}
          maxLength={300}
          value={publicMessage}
          placeholder="Regalos digitales hechos con cariño. Entrega el mismo día."
          onChange={(e) => setPublicMessage(e.target.value)}
          onBlur={() => publicMessage !== (data.publicMessage || "") && save({ publicMessage })}
        />
      </div>
    </section>
  );
}
