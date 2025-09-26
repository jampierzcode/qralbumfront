import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FaTachometerAlt, // dashboard
  FaUsers, // clientes
  FaUserCircle, // mi cuenta
  FaSignOutAlt, // logout
} from "react-icons/fa";

const { Sider } = Layout;

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const items = [
    {
      key: "/dashboard",
      icon: <FaTachometerAlt />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
  ];

  if (user.role !== "cliente") {
    items.push({
      key: "/clientes",
      icon: <FaUsers />,
      label: <Link to="/clientes">Clientes</Link>,
    });
  }

  if (user.role === "cliente") {
    items.push({
      key: "/mi-cuenta",
      icon: <FaUserCircle />,
      label: <Link to="/mi-cuenta">Mi Cuenta</Link>,
    });
  }

  return (
    <Sider
      className="py-12"
      breakpoint="md"
      collapsedWidth="0"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Logo y nombre */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        <img
          src="/logo.png" // aquí pones tu logo
          alt="logo"
          style={{ width: 32, height: 32 }}
        />
        <p>MiAlbumLove</p>
      </div>

      {/* Menu principal */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        style={{ flex: 1 }}
      />

      {/* Logout siempre abajo */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: "#fff",
        }}
        onClick={logout}
      >
        <FaSignOutAlt /> Logout
      </div>
    </Sider>
  );
};

export default Sidebar;
