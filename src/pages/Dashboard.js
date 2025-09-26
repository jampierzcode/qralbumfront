import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography } from "antd";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
// import { Pie, Bar, Line } from "react-chartjs-2";
import api from "../api";
import { Pie, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale
);

export default function Dashboard() {
  const [clients, setClients] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/clients/with/multimedia/all");
      setClients(res.data);
    } catch (err) {
      console.error("Error cargando dashboard:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 📊 Procesar datos
  const totalClients = clients.length;
  const totalMultimedia = clients.reduce(
    (acc, c) => acc + c.Multimedia.length,
    0
  );
  const ingresosTotales = totalClients * 15; // cada cliente representa 15 soles

  // Conteo de multimedia por tipo
  const multimediaPorTipo = clients.reduce((acc, c) => {
    c.Multimedia.forEach((m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
    });
    return acc;
  }, {});

  // Clientes por fecha de creación
  const clientesPorFecha = clients.reduce((acc, c) => {
    const fecha = new Date(c.createdAt).toLocaleDateString();
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Typography.Title level={4}>Total Clientes</Typography.Title>
            <Typography.Text strong>{totalClients}</Typography.Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Typography.Title level={4}>Total Multimedia</Typography.Title>
            <Typography.Text strong>{totalMultimedia}</Typography.Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Typography.Title level={4}>Ingresos Totales</Typography.Title>
            <Typography.Text strong>S/. {ingresosTotales}</Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 20 }}>
        <Col span={12}>
          <Card title="Multimedia por Tipo">
            <Pie
              data={{
                labels: Object.keys(multimediaPorTipo),
                datasets: [
                  {
                    label: "Cantidad",
                    data: Object.values(multimediaPorTipo),
                    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                  },
                ],
              }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Clientes por Día">
            <Bar
              data={{
                labels: Object.keys(clientesPorFecha),
                datasets: [
                  {
                    label: "Clientes",
                    data: Object.values(clientesPorFecha),
                    backgroundColor: "#36A2EB",
                  },
                ],
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
