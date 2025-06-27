import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const items = [
    { key: "/dashboard", label: <Link to="/dashboard">Dashboard</Link> },
  ];

  if (user.role !== "cliente") {
    items.push({
      key: "/clientes",
      label: <Link to="/clientes">Clientes</Link>,
    });
  }

  if (user.role === "cliente") {
    items.push({
      key: "/mi-cuenta",
      label: <Link to="/mi-cuenta">Mi Cuenta</Link>,
    });
  }

  items.push({ key: "logout", label: <a onClick={logout}>Logout</a> });

  return <Menu selectedKeys={[location.pathname]} items={items} />;
};

export default Sidebar;
