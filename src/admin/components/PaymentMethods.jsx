import { useState } from "react";
import { App, Button, Form, Input, Modal, Popconfirm, Select, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { copyText } from "./ShareDialog.jsx";

const TYPES = [
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "bim", label: "BIM" },
  { value: "transfer", label: "Transferencia" },
];

/** Datos con los que te pagan. El cliente final los ve al momento de pagar. */
export default function PaymentMethods() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRequest(() => adminApi.paymentMethods(), []);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const items = data?.items || [];

  const open = (method) => {
    setEditing(method || {});
    form.setFieldsValue(method || { type: "yape", reference: "", holder: "", bank: "", notes: "" });
  };

  const save = async (values) => {
    try {
      if (editing?.id) await adminApi.updatePaymentMethod(editing.id, values);
      else await adminApi.createPaymentMethod(values);
      message.success("Guardado");
      setEditing(null);
      reload();
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  const remove = async (id) => {
    try {
      await adminApi.deletePaymentMethod(id);
      reload();
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  return (
    <section className="adm-section">
      <div className="adm-list-head">
        <div>
          <h2 className="adm-section-title" style={{ marginBottom: 2 }}>Cómo te pagan</h2>
          <p className="adm-muted adm-small" style={{ margin: 0 }}>
            Tus clientes verán estos datos al momento de pagar su regalo.
          </p>
        </div>
        <Button icon={<PlusOutlined />} onClick={() => open(null)}>
          Agregar
        </Button>
      </div>

      {loading && !data ? null : items.length === 0 ? (
        <p className="adm-muted adm-small">Todavía no agregaste ningún medio de pago.</p>
      ) : (
        <div className="adm-rows">
          {items.map((m) => (
            <div key={m.id} className="adm-row">
              <div className="adm-row__main">
                <span className="adm-row__title">
                  {m.typeLabel} · {m.reference} {!m.isActive && <Tag>Oculto</Tag>}
                </span>
                <span className="adm-row__meta">{[m.holder, m.bank, m.notes].filter(Boolean).join(" · ") || "Sin más datos"}</span>
              </div>
              <div className="adm-row__side">
                <Button type="text" size="small" icon={<EditOutlined />} aria-label="Editar" onClick={() => open(m)} />
                <Popconfirm title="¿Eliminar este medio de pago?" okText="Eliminar" cancelText="Cancelar" onConfirm={() => remove(m.id)}>
                  <Button type="text" size="small" icon={<DeleteOutlined />} aria-label="Eliminar" />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        title={editing?.id ? "Editar medio de pago" : "Nuevo medio de pago"}
        okText="Guardar"
        cancelText="Cancelar"
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
          <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
            <Select size="large" options={TYPES} />
          </Form.Item>
          <Form.Item name="reference" label="Número o cuenta" rules={[{ required: true, message: "Escribe el número o la cuenta" }]}>
            <Input size="large" placeholder="987 654 321 · 191-12345678-0-12" />
          </Form.Item>
          <Form.Item name="holder" label="A nombre de">
            <Input size="large" placeholder="Jampier V." />
          </Form.Item>
          <Form.Item name="bank" label="Banco (si es transferencia)">
            <Input size="large" placeholder="BCP, Interbank…" />
          </Form.Item>
          <Form.Item name="notes" label="Nota (opcional)">
            <Input size="large" maxLength={200} placeholder="Ej. enviar captura al WhatsApp" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

/** Los datos del dueño: cómo le paga un referido lo que debe. */
export function OwnerPaymentMethods({ amount }) {
  const { message } = App.useApp();
  const { data } = useRequest(() => adminApi.ownerPaymentMethods(), []);
  const methods = data?.methods || [];
  if (!methods.length) return null;

  return (
    <section className="adm-section">
      <h2 className="adm-section-title">Cómo pagar{amount ? ` los ${amount}` : ""}</h2>
      <div className="adm-rows">
        {methods.map((m) => (
          <div key={m.id} className="adm-row">
            <div className="adm-row__main">
              <span className="adm-row__title">
                {m.typeLabel} · {m.reference}
              </span>
              <span className="adm-row__meta">{[m.holder || data?.owner?.name, m.bank, m.notes].filter(Boolean).join(" · ")}</span>
            </div>
            <div className="adm-row__side">
              <Button
                size="small"
                onClick={async () => ((await copyText(m.reference)) ? message.success("Copiado") : message.error("No se pudo copiar"))}
              >
                Copiar
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="adm-muted adm-small" style={{ marginTop: 8 }}>
        Después de pagar, avisa por WhatsApp o adjunta el comprobante al enviar el regalo a aprobación.
      </p>
    </section>
  );
}
