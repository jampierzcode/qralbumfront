import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { adminApi, errorMessage } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Brand } from "../layout/AdminLayout.jsx";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const from = location.state?.from || "/admin";

  if (user) return <Navigate to={from} replace />;

  const submit = async (values) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.login(values);
      login(res.token, { role: res.role, ...res.user });
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "No pudimos iniciar sesión."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <Brand />
        <h1 className="adm-login__title">Bienvenido de vuelta</h1>
        <p className="adm-muted" style={{ margin: "0 0 24px" }}>
          Ingresa para crear y gestionar regalos.
        </p>
        <Form layout="vertical" requiredMark={false} onFinish={submit} disabled={loading}>
          <Form.Item name="email" label="Correo" rules={[{ required: true, message: "Escribe tu correo." }]}>
            <Input size="large" type="email" autoComplete="email" inputMode="email" placeholder="tu@correo.com" />
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, message: "Escribe tu contraseña." }]}>
            <Input.Password size="large" autoComplete="current-password" placeholder="••••••••" />
          </Form.Item>
          {error && (
            <p role="alert" style={{ margin: "-4px 0 16px", color: "#dc2626" }}>
              {error}
            </p>
          )}
          <Button type="primary" htmlType="submit" size="large" block loading={loading}>
            Entrar
          </Button>
        </Form>
      </div>
    </div>
  );
}
