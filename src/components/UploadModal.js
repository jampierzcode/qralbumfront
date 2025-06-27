import { Modal, Upload, Select, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import api from "../api";

const { Dragger } = Upload;
const { Option } = Select;

export default function UploadModal({ visible, onClose, clientUuid, refresh }) {
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("photo");

  const handleUpload = async () => {
    if (!files.length) return message.error("Selecciona archivos");

    const form = new FormData();
    form.append("type", type);
    form.append("files", files[0]);
    files.slice(1).forEach((file) => form.append("files", file));

    await api.post(`/upload/${clientUuid}`, form);
    message.success("Subida exitosa");
    setFiles([]);
    onClose();
    refresh();
  };

  return (
    <Modal
      title="Subir archivos"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="upload" type="primary" onClick={handleUpload}>
          Subir
        </Button>,
      ]}
    >
      <Select
        value={type}
        onChange={setType}
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Option value="photo">Fotos</Option>
        <Option value="video">Videos</Option>
        <Option value="audio">Audio</Option>
      </Select>
      <Dragger
        multiple
        beforeUpload={(f) => {
          setFiles((prev) => [...prev, f]);
          return false;
        }}
        fileList={files.map((f) => ({ uid: f.uid, name: f.name }))}
      >
        <p>
          <UploadOutlined /> Arrastra archivos o haz clic
        </p>
      </Dragger>
    </Modal>
  );
}
