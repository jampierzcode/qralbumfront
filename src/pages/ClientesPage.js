import { Table, Button, message, Modal } from "antd";
import { useState, useEffect } from "react";
import api from "../api";
import { QRCodeSVG } from "qrcode.react";

import UploadModal from "../components/UploadModal";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState({ visible: false, uuid: null });

  const load = async () => {
    const res = await api.get("/clients");
    setClientes(res.data);
  };
  useEffect(() => {
    load();
  }, [0]);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [clienteCreated, setClienteCreated] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isModalCreated, setIsModalCreated] = useState(false);

  const handleCreate = async () => {
    try {
      const res = await api.post("/clients", clienteCreated);
      console.log(res);
      message.success("Cliente creado");
      await load();
      setClienteCreated({
        name: "",
        email: "",
        password: "",
      });
      setIsModalCreated(false);
    } catch (error) {
      message.error("Sucedio un error contactar a proveedor");
      console.log(error);
    }
  };
  const create = async () => {
    setIsModalCreated(true);
  };

  const columns = [
    { title: "Nombre", dataIndex: "name" },
    {
      title: "UUID",
      dataIndex: "uuid",
      render: (_, r) => (
        <>
          {r.uuid}
          <br />
          <QRCodeSVG value={`http://localhost:3000/${r.uuid}`} size={64} />
        </>
      ),
    },
    {
      title: "Archivos",
      render: (_, r) => (
        <Button onClick={() => setModal({ visible: true, uuid: r.uuid })}>
          Subir / Ver
        </Button>
      ),
    },
  ];
  console.log(modal);
  const setCancelCreated = () => {
    setIsModalCreated(false);
    setClienteCreated({
      name: "",
      email: "",
      password: "",
    });
  };
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeCreate = (value, etiqueta) => {
    setClienteCreated((prev) => ({
      ...prev,
      [etiqueta]: value,
    }));
  };

  return (
    <>
      <Button type="primary" onClick={create} style={{ marginBottom: 16 }}>
        Crear cliente
      </Button>
      <Modal
        open={isModalCreated}
        footer={false}
        onCancel={() => setCancelCreated()}
      >
        <div className="w-full">
          <input
            type="text"
            value={clienteCreated.name}
            placeholder="Ingresa tu nombre"
            onChange={(e) => handleChangeCreate(e.target.value, "name")}
          />
          <input
            type="email"
            value={clienteCreated.email}
            placeholder="Ingresa tu email"
            onChange={(e) => handleChangeCreate(e.target.value, "email")}
          />
          <input
            type={showPassword ? "text" : "password"}
            value={clienteCreated.password}
            placeholder="Ingresa tu password"
            onChange={(e) => handleChangeCreate(e.target.value, "password")}
          />
          <button onClick={() => setShowPassword(!showPassword)}>
            ver/no ver
          </button>
          <button onClick={() => handleCreate()}>registrar cliente</button>
        </div>
      </Modal>
      <Table dataSource={clientes} columns={columns} rowKey="id" />
      {modal.visible && (
        <UploadModal
          visible={modal.visible}
          onClose={() => setModal({ visible: false, uuid: null })}
          clientUuid={modal.uuid}
          refresh={load}
        />
      )}
    </>
  );
}
