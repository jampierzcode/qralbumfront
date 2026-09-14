import { useEffect, useMemo, useState } from "react";
import { App, Button, Form, Input, Modal, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { adminApi, errorMessage } from "../api.js";
import { initials } from "../lib/format.js";

/** Crear o editar cliente. Sin contraseña: el comprador nunca inicia sesión. */
export function CustomerFormModal({ open, onClose, onSaved, customer }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const editing = Boolean(customer?.id);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: "", phone: "", email: "", notes: "", ...(customer || {}) });
      setError("");
    }
  }, [open, customer, form]);

  const submit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    setError("");
    try {
      const saved = editing ? await adminApi.updateCustomer(customer.id, values) : await adminApi.createCustomer(values);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editing ? "Editar cliente" : "Nuevo cliente"}
      okText={editing ? "Guardar" : "Crear cliente"}
      cancelText="Cancelar"
      onOk={submit}
      confirmLoading={saving}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" requiredMark={false} onFinish={submit} style={{ marginTop: 12 }}>
        <Form.Item name="name" label="Nombre" rules={[{ required: true, whitespace: true, message: "Escribe el nombre del cliente." }]}>
          <Input placeholder="Carla Ruiz" autoFocus size="large" />
        </Form.Item>
        <Form.Item name="phone" label="WhatsApp" extra="Con código de país, ej. +51 987 654 321">
          <Input placeholder="+51 987 654 321" inputMode="tel" size="large" />
        </Form.Item>
        <Form.Item name="email" label="Email (opcional)" rules={[{ type: "email", message: "El email no parece válido." }]}>
          <Input placeholder="carla@correo.com" inputMode="email" size="large" />
        </Form.Item>
        <Form.Item name="notes" label="Notas (opcional)">
          <Input.TextArea placeholder="Pagó por Yape, lo quiere para el sábado…" autoSize={{ minRows: 2, maxRows: 5 }} />
        </Form.Item>
        {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
        <button type="submit" hidden />
      </Form>
    </Modal>
  );
}

/** Selector de cliente con búsqueda y creación rápida. */
export function CustomerPicker({ value, onChange, allowClear = true }) {
  const { message } = App.useApp();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    adminApi
      .customers()
      .then((res) => setCustomers(res.items))
      .catch((err) => message.error(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [message]);

  const options = useMemo(
    () =>
      customers.map((c) => ({
        value: c.id,
        search: `${c.name} ${c.phone || ""} ${c.email || ""}`.toLowerCase(),
        label: c.name,
        phone: c.phone,
      })),
    [customers]
  );

  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        <Select
          size="large"
          style={{ flex: 1, minWidth: 0 }}
          showSearch
          allowClear={allowClear}
          loading={loading}
          placeholder="Buscar cliente…"
          value={value ?? undefined}
          onChange={(v) => onChange(v ?? null)}
          options={options}
          optionRender={(option) => (
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span className="adm-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                {initials(option.data.label)}
              </span>
              <span style={{ display: "grid", minWidth: 0 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{option.data.label}</span>
                {option.data.phone && <span className="adm-muted adm-small">{option.data.phone}</span>}
              </span>
            </span>
          )}
          filterOption={(input, option) => option.search.includes(input.toLowerCase())}
          notFoundContent={loading ? "Cargando…" : "Sin resultados"}
        />
        <Button size="large" icon={<PlusOutlined />} onClick={() => setCreating(true)} aria-label="Nuevo cliente">
          <span className="adm-editor__desktop-only">Nuevo</span>
        </Button>
      </div>
      <CustomerFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(created) => {
          setCustomers((prev) => [created, ...prev]);
          onChange(created.id);
          message.success("Cliente creado");
        }}
      />
    </>
  );
}
