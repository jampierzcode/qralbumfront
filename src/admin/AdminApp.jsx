import { Navigate, Route, Routes } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import "./admin.css";
import { AuthProvider } from "../context/AuthContext";
import PrivateRoute from "../components/PrivateRoute";
import Layouts from "../components/Layouts";
import LoginPage from "../pages/LoginPage";
import Dashboard from "../pages/Dashboard";
import ClientesPage from "../pages/ClientesPage";

// Admin (carga diferida: la experiencia pública nunca descarga Ant Design).
export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layouts>
                <Dashboard />
              </Layouts>
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute roles={["superadmin", "admin"]}>
              <Layouts>
                <ClientesPage />
              </Layouts>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<h2 style={{ padding: 24 }}>404 no encontrado</h2>} />
      </Routes>
    </AuthProvider>
  );
}
