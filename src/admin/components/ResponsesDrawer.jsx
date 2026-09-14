import { useEffect, useState } from "react";
import { App, Button, Drawer, Empty, Popconfirm, Skeleton } from "antd";
import { CopyOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import api, { errorMessage } from "../api.js";
import { timeAgo } from "../lib/format.js";
import { copyText } from "./ShareDialog.jsx";

const ANSWERS = {
  yes: { label: "Sí va", tone: "green" },
  maybe: { label: "Tal vez", tone: "amber" },
  no: { label: "No va", tone: "stone" },
};

/** Confirmaciones de asistencia de una invitación. */
export default function ResponsesDrawer({ gift, open, onClose }) {
  const { message } = App.useApp();
  const [state, setState] = useState({ loading: true, data: null });

  const load = async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await api.get(`/admin/gifts/${gift.id}/responses`, { params: { type: "rsvp" } });
      setState({ loading: false, data: res.data });
    } catch (err) {
      message.error(errorMessage(err));
      setState({ loading: false, data: null });
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id) => {
    try {
      await api.delete(`/admin/gifts/${gift.id}/responses/${id}`);
      load();
    } catch (err) {
      message.error(errorMessage(err));
    }
  };

  const summary = state.data?.summary;
  const items = state.data?.items || [];

  const copyList = async () => {
    const lines = [
      `Confirmaciones · ${gift.recipientName || "Invitación"}`,
      `Van: ${summary.yes} (${summary.guestsYes} personas) · Tal vez: ${summary.maybe} · No: ${summary.no}`,
      "",
      ...items.map((r) => `${ANSWERS[r.answer].label} · ${r.name}${r.answer !== "no" ? ` · ${r.guests} ${r.guests === 1 ? "persona" : "personas"}` : ""}${r.message ? ` · "${r.message}"` : ""}`),
    ];
    (await copyText(lines.join("\n"))) ? message.success("Lista copiada") : message.error("No se pudo copiar");
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Confirmaciones de asistencia"
      width={440}
      extra={<Button icon={<ReloadOutlined />} onClick={load} aria-label="Actualizar" />}
    >
      {state.loading && !state.data ? (
        <Skeleton active />
      ) : !summary ? null : (
        <div style={{ display: "grid", gap: 20 }}>
          <div className="adm-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="adm-stat">
              <span className="adm-stat__label">Van</span>
              <span className="adm-stat__value">{summary.guestsYes}</span>
              <span className="adm-muted adm-small">{summary.yes} respuestas</span>
            </div>
            <div className="adm-stat">
              <span className="adm-stat__label">Tal vez</span>
              <span className="adm-stat__value">{summary.guestsMaybe}</span>
              <span className="adm-muted adm-small">{summary.maybe} respuestas</span>
            </div>
            <div className="adm-stat">
              <span className="adm-stat__label">No van</span>
              <span className="adm-stat__value">{summary.no}</span>
            </div>
          </div>

          {items.length === 0 ? (
            <Empty description="Todavía nadie confirmó. Comparte el link de la invitación." />
          ) : (
            <>
              <Button icon={<CopyOutlined />} onClick={copyList}>
                Copiar lista
              </Button>
              <div className="adm-rows">
                {items.map((r) => (
                  <div key={r.id} className="adm-row">
                    <div className="adm-row__main">
                      <span className="adm-row__title">{r.name}</span>
                      <span className="adm-row__meta">
                        {r.answer !== "no" ? `${r.guests} ${r.guests === 1 ? "persona" : "personas"} · ` : ""}
                        {timeAgo(r.updatedAt)}
                      </span>
                      {r.message && <span className="adm-row__meta">“{r.message}”</span>}
                    </div>
                    <div className="adm-row__side">
                      <span className={`adm-status adm-status--${ANSWERS[r.answer].tone}`}>{ANSWERS[r.answer].label}</span>
                      <Popconfirm title="¿Eliminar esta respuesta?" okText="Eliminar" cancelText="Cancelar" onConfirm={() => remove(r.id)}>
                        <Button type="text" size="small" icon={<DeleteOutlined />} aria-label={`Eliminar respuesta de ${r.name}`} />
                      </Popconfirm>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}
