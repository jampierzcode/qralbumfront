import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Drawer, Dropdown } from "antd";
import {
  AppstoreOutlined,
  WalletOutlined,
  SolutionOutlined,
  ShopOutlined,
  FolderOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MoreOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useAuth, useIsReferral } from "../auth.jsx";
import { initials } from "../lib/format.js";

const BASE_NAV = [
  { to: "/admin", label: "Inicio", icon: <HomeOutlined />, end: true },
  { to: "/admin/gifts", label: "Regalos", icon: <GiftOutlined /> },
  { to: "/admin/customers", label: "Clientes", icon: <TeamOutlined /> },
];

const BUSINESS_NAV = { to: "/admin/business", label: "Mi negocio", icon: <ShopOutlined /> };

const ADMIN_NAV = [
  { to: "/admin/templates", label: "Plantillas", icon: <AppstoreOutlined /> },
  { to: "/admin/collections", label: "Colecciones", icon: <FolderOutlined /> },
  { to: "/admin/referrals", label: "Referidos", icon: <SolutionOutlined /> },
  BUSINESS_NAV,
];

// El referido ve su cuenta por pagar en vez del catálogo.
const REFERRAL_NAV = [{ to: "/admin/account", label: "Mi cuenta", icon: <WalletOutlined /> }, BUSINESS_NAV];

export function Brand() {
  return (
    <Link to="/admin" className="adm-brand" aria-label="Inicio">
      <span className="adm-brand__mark" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.2.3.8.3 1 0 .7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" />
        </svg>
      </span>
      <span className="adm-brand__name">MiAlbumLove</span>
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const isReferral = useIsReferral();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const NAV = [...BASE_NAV, ...(isReferral ? REFERRAL_NAV : ADMIN_NAV)];

  return (
    <div className="adm-shell">
      {/* Escritorio */}
      <aside className="adm-sidebar">
        <Brand />
        <Link to="/admin/gifts/new" className="adm-cta">
          <PlusOutlined /> Nuevo regalo
        </Link>
        <nav className="adm-nav" aria-label="Principal">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="adm-nav__item">
              <span className="adm-nav__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="adm-sidebar__footer">
          <Dropdown
            trigger={["click"]}
            placement="topLeft"
            menu={{ items: [{ key: "logout", icon: <LogoutOutlined />, label: "Cerrar sesión", onClick: logout }] }}
          >
            <button type="button" className="adm-user">
              <span className="adm-avatar">{initials(user?.name || "Admin")}</span>
              <span className="adm-user__name">{user?.name || "Administrador"}</span>
              <MoreOutlined />
            </button>
          </Dropdown>
        </div>
      </aside>

      {/* Móvil */}
      <header className="adm-topbar">
        <Brand />
      </header>

      <main className="adm-main" key={location.pathname}>
        {children}
      </main>

      <nav className="adm-tabbar" aria-label="Principal">
        {NAV.slice(0, 2).map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="adm-tabbar__item">
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <Link to="/admin/gifts/new" className="adm-tabbar__create" aria-label="Nuevo regalo">
          <PlusOutlined />
        </Link>
        <NavLink to="/admin/customers" className="adm-tabbar__item">
          <TeamOutlined />
          <span>Clientes</span>
        </NavLink>
        <button type="button" className="adm-tabbar__item" onClick={() => setMoreOpen(true)}>
          <MoreOutlined />
          <span>Más</span>
        </button>
      </nav>

      <Drawer placement="bottom" open={moreOpen} onClose={() => setMoreOpen(false)} height="auto" title="Más" className="adm-more">
        <div className="adm-more__list">
          {NAV.slice(3).map((item) => (
            <Link key={item.to} to={item.to} className="adm-more__item" onClick={() => setMoreOpen(false)}>
              {item.icon} {item.label}
            </Link>
          ))}
          <button type="button" className="adm-more__item" onClick={logout}>
            <LogoutOutlined /> Cerrar sesión
          </button>
        </div>
      </Drawer>
    </div>
  );
}
