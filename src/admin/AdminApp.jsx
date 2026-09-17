import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "@ant-design/v5-patch-for-react-19";
import "antd/dist/reset.css";
import "@fontsource-variable/inter";
import "./styles/admin.css";
import { AuthProvider, RequireAdmin, RequireAuth } from "./auth.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import { PageSkeleton } from "./components/Skeletons.jsx";

dayjs.locale("es");

const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const GiftsPage = lazy(() => import("./pages/GiftsPage.jsx"));
const GiftWizardPage = lazy(() => import("./pages/GiftWizardPage.jsx"));
const GiftSetupPage = lazy(() => import("./pages/GiftSetupPage.jsx"));
const GiftEditorPage = lazy(() => import("./pages/GiftEditorPage.jsx"));
const GiftPreviewPage = lazy(() => import("./pages/GiftPreviewPage.jsx"));
const CustomersPage = lazy(() => import("./pages/CustomersPage.jsx"));
const CustomerDetailPage = lazy(() => import("./pages/CustomerDetailPage.jsx"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage.jsx"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage.jsx"));
const TemplateLabPage = lazy(() => import("./pages/TemplateLabPage.jsx"));
const ReferralsPage = lazy(() => import("./pages/ReferralsPage.jsx"));
const AccountPage = lazy(() => import("./pages/AccountPage.jsx"));
const BusinessPage = lazy(() => import("./pages/BusinessPage.jsx"));

const theme = {
  token: {
    colorPrimary: "#1b1a18",
    colorInfo: "#1b1a18",
    colorLink: "#c0355f",
    colorSuccess: "#15803d",
    colorWarning: "#b45309",
    colorError: "#dc2626",
    colorText: "#1b1a18",
    colorTextSecondary: "#6f6c66",
    colorBorder: "#e6e4df",
    colorBorderSecondary: "#efede9",
    colorBgLayout: "#f7f6f3",
    borderRadius: 10,
    borderRadiusLG: 14,
    controlHeight: 40,
    fontFamily: '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    boxShadowSecondary: "0 12px 32px rgb(27 26 24 / 0.12)",
  },
  components: {
    Button: { fontWeight: 550, primaryShadow: "none", defaultShadow: "none" },
    Segmented: { itemSelectedBg: "#ffffff", trackBg: "#efede9" },
    Modal: { borderRadiusLG: 18 },
    Dropdown: { borderRadiusLG: 12 },
  },
};

function Protected({ children, bare = false, adminOnly = false }) {
  const Guard = adminOnly ? RequireAdmin : RequireAuth;
  return (
    <Guard>
      {bare ? (
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      ) : (
        <AdminLayout>
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </AdminLayout>
      )}
    </Guard>
  );
}

// Admin (carga diferida: la experiencia pública nunca descarga Ant Design).
export default function AdminApp() {
  return (
    <ConfigProvider theme={theme} locale={esES}>
      <AntApp className="adm-root">
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Suspense fallback={null}><LoginPage /></Suspense>} />
            <Route path="/admin" element={<Protected><HomePage /></Protected>} />
            <Route path="/admin/gifts" element={<Protected><GiftsPage /></Protected>} />
            <Route path="/admin/gifts/new" element={<Protected><GiftWizardPage /></Protected>} />
            <Route path="/admin/gifts/:id/setup" element={<Protected bare><GiftSetupPage /></Protected>} />
            <Route path="/admin/gifts/:id/preview" element={<Protected bare><GiftPreviewPage /></Protected>} />
            <Route path="/admin/gifts/:id" element={<Protected bare><GiftEditorPage /></Protected>} />
            <Route path="/admin/customers" element={<Protected><CustomersPage /></Protected>} />
            <Route path="/admin/customers/:id" element={<Protected><CustomerDetailPage /></Protected>} />
            <Route path="/admin/templates" element={<Protected adminOnly><TemplatesPage /></Protected>} />
            <Route path="/admin/collections" element={<Protected adminOnly><CollectionsPage /></Protected>} />
            <Route path="/admin/referrals" element={<Protected adminOnly><ReferralsPage /></Protected>} />
            <Route path="/admin/account" element={<Protected><AccountPage /></Protected>} />
            <Route path="/admin/business" element={<Protected><BusinessPage /></Protected>} />
            <Route path="/admin/lab/:templateId?" element={<Protected bare adminOnly><TemplateLabPage /></Protected>} />
            {/* Rutas anteriores */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/clientes" element={<Navigate to="/admin/customers" replace />} />
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
