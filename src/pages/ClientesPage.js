import {
  Table,
  Button,
  message,
  Modal,
  Input,
  Popconfirm,
  Upload,
  Card,
  Space,
  Image,
  Typography,
} from "antd";
import { useState, useEffect } from "react";
import api from "../api";
import { QRCodeSVG } from "qrcode.react";
import {
  CopyOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const UploadSection = ({ type, uuid, fetchFiles }) => {
  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("files", file); // aquí sin []
    formData.append("type", type);

    try {
      await api.post(`/upload/${uuid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Archivo subido");
      fetchFiles(uuid);
      onSuccess();
    } catch (err) {
      console.error(err);
      message.error("Error al subir");
      onError(err);
    }
  };

  return (
    <Upload
      customRequest={handleUpload}
      showUploadList={false}
      multiple
      accept={
        type === "photo" ? "image/*" : type === "video" ? "video/*" : "audio/*"
      }
    >
      <Button icon={<PlusOutlined />}>Agregar {type}</Button>
    </Upload>
  );
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [modal, setModal] = useState({ visible: false, uuid: null });
  const [files, setFiles] = useState([]);

  // Modal de preview multimedia
  const [preview, setPreview] = useState({ visible: false, type: "", url: "" });

  const fetchClientes = async () => {
    const res = await api.get("/clients");
    setClientes(res.data);
  };
  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      message.success("Cliente eliminado correctamente");
      // recargar lista de clientes
      await fetchClientes();
    } catch (err) {
      console.error(err);
      message.error("Error al eliminar cliente");
    }
  };

  // Crear cliente
  const [clienteCreated, setClienteCreated] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isModalCreated, setIsModalCreated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCreate = async () => {
    try {
      await api.post("/clients", clienteCreated);
      message.success("Cliente creado");
      await fetchClientes();
      setClienteCreated({ name: "", email: "", password: "" });
      setIsModalCreated(false);
    } catch (error) {
      message.error("Error al crear cliente");
    }
  };

  const handleChangeCreate = (value, etiqueta) => {
    setClienteCreated((prev) => ({ ...prev, [etiqueta]: value }));
  };

  // Subir archivo

  // Traer multimedia
  const fetchFiles = async (uuid) => {
    try {
      const res = await api.get(`/clients/${uuid}/files`);
      setFiles(res.data);
    } catch {
      setFiles([]);
    }
  };

  // Eliminar multimedia
  const deleteFile = async (id) => {
    try {
      await api.delete(`/upload/${id}`);
      message.success("Eliminado correctamente");
      fetchFiles(modal.uuid);
    } catch {
      message.error("Error al eliminar");
    }
  };

  // Agrupar archivos por tipo
  const photos = files.filter((f) => f.type.startsWith("photo"));
  const videos = files.filter((f) => f.type.startsWith("video"));
  const audios = files.filter((f) => f.type.startsWith("audio"));

  // Columnas tabla clientes
  const columns = [
    { title: "Nombre", dataIndex: "name" },
    {
      title: "UUID",
      dataIndex: "uuid",
      render: (_, r) => (
        <>
          {r.uuid}
          <br />
          <QRCodeSVG
            value={`${window.location.origin}/c/${r.uuid}`}
            size={64}
          />
        </>
      ),
    },
    {
      title: "Acciones",
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setModal({ visible: true, uuid: r.uuid });
              fetchFiles(r.uuid);
            }}
          >
            Ver álbum
          </Button>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              const url = `${window.location.origin}/c/${r.uuid}`;
              navigator.clipboard.writeText(url);
              message.success("Enlace copiado");
            }}
          >
            Copiar link
          </Button>
          <Popconfirm
            title="¿Eliminar cliente?"
            onConfirm={() => handleDelete(r.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Botón crear cliente */}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalCreated(true)}
        style={{ marginBottom: 16 }}
      >
        Crear cliente
      </Button>

      <Table
        dataSource={clientes}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        style={{ width: "100%" }}
        scroll={{ x: "max-content" }} // 👈 fuerza scroll horizontal en pantallas pequeñas
      />

      {/* Modal crear cliente */}
      <Modal
        open={isModalCreated}
        title="Crear Cliente"
        onCancel={() => setIsModalCreated(false)}
        onOk={handleCreate}
      >
        <Input
          style={{ marginBottom: 10 }}
          value={clienteCreated.name}
          placeholder="Nombre"
          onChange={(e) => handleChangeCreate(e.target.value, "name")}
        />
        <Input
          style={{ marginBottom: 10 }}
          type="email"
          value={clienteCreated.email}
          placeholder="Email"
          onChange={(e) => handleChangeCreate(e.target.value, "email")}
        />
        <Input.Password
          style={{ marginBottom: 10 }}
          value={clienteCreated.password}
          placeholder="Password"
          visibilityToggle={{
            visible: showPassword,
            onVisibleChange: setShowPassword,
          }}
          onChange={(e) => handleChangeCreate(e.target.value, "password")}
        />
      </Modal>

      {/* Modal multimedia */}
      <Modal
        open={modal.visible}
        title="Gestión de Álbum"
        width={1000}
        onCancel={() => setModal({ visible: false, uuid: null })}
        footer={null}
      >
        {/* Fotos */}
        <Title level={4} style={{ marginTop: 20 }}>
          Fotos
        </Title>
        <UploadSection type="photo" uuid={modal.uuid} fetchFiles={fetchFiles} />
        {photos.length > 0 && (
          <>
            <Image.PreviewGroup>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                {photos.map((file) => (
                  <Card
                    key={file.id}
                    extra={
                      <Popconfirm
                        title="¿Seguro que deseas eliminar?"
                        onConfirm={() => deleteFile(file.id)}
                        okText="Sí"
                        cancelText="No"
                      >
                        <DeleteOutlined
                          style={{ color: "red", cursor: "pointer" }}
                        />
                      </Popconfirm>
                    }
                  >
                    <Image
                      src={file.url}
                      alt={file.filename}
                      style={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "cover",
                      }}
                    />
                  </Card>
                ))}
              </div>
            </Image.PreviewGroup>
          </>
        )}

        {/* Videos */}
        <Title level={4} style={{ marginTop: 20 }}>
          Videos
        </Title>
        <UploadSection type="video" uuid={modal.uuid} fetchFiles={fetchFiles} />
        {videos.length > 0 && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 16,
              }}
            >
              {videos.map((file) => (
                <Card
                  key={file.id}
                  extra={
                    <Popconfirm
                      title="¿Seguro que deseas eliminar?"
                      onConfirm={() => deleteFile(file.id)}
                      okText="Sí"
                      cancelText="No"
                    >
                      <DeleteOutlined
                        style={{ color: "red", cursor: "pointer" }}
                      />
                    </Popconfirm>
                  }
                  onClick={() =>
                    setPreview({ visible: true, type: "video", url: file.url })
                  }
                  hoverable
                >
                  <video
                    src={file.url}
                    style={{ width: "100%", maxHeight: 200 }}
                  />
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Audios */}
        <Title level={4} style={{ marginTop: 20 }}>
          Audios
        </Title>
        <UploadSection type="audio" uuid={modal.uuid} fetchFiles={fetchFiles} />
        {audios.length > 0 && (
          <>
            <div style={{ display: "grid", gap: 16 }}>
              {audios.map((file) => (
                <Card
                  key={file.id}
                  extra={
                    <Popconfirm
                      title="¿Seguro que deseas eliminar?"
                      onConfirm={() => deleteFile(file.id)}
                      okText="Sí"
                      cancelText="No"
                    >
                      <DeleteOutlined
                        style={{ color: "red", cursor: "pointer" }}
                      />
                    </Popconfirm>
                  }
                >
                  <audio controls style={{ width: "100%" }}>
                    <source src={file.url} />
                  </audio>
                </Card>
              ))}
            </div>
          </>
        )}
      </Modal>

      {/* Modal de preview para video/audio */}
      <Modal
        open={preview.visible}
        onCancel={() => setPreview({ visible: false, type: "", url: "" })}
        footer={null}
        width={800}
      >
        {preview.type === "video" ? (
          <video
            src={preview.url}
            controls
            style={{ width: "100%" }}
            autoPlay
          />
        ) : preview.type === "audio" ? (
          <audio
            src={preview.url}
            controls
            autoPlay
            style={{ width: "100%" }}
          />
        ) : null}
      </Modal>
    </>
  );
}
