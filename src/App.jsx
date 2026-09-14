import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

const GiftPage = lazy(() => import("./public/GiftPage.jsx"));
const DemoPage = lazy(() => import("./public/DemoPage.jsx"));
const FramePage = lazy(() => import("./public/FramePage.jsx"));
const LegacyRedirect = lazy(() => import("./public/LegacyRedirect.jsx"));
const UploadPortalPage = lazy(() => import("./portal/UploadPortalPage.jsx"));
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));
// Herramientas para crear plantillas: sólo en desarrollo.
const SchemaPlayground = import.meta.env.DEV ? lazy(() => import("./dev/SchemaPlayground.jsx")) : null;

const LEGACY_UUID = /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i;

// Links antiguos /<uuid> sin cargar el admin.
function RootSwitch() {
  const { pathname } = useLocation();
  const legacy = pathname.match(LEGACY_UUID);
  if (legacy) return <LegacyRedirect uuid={legacy[1]} />;
  return <AdminApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/g/:slug" element={<GiftPage />} />
          <Route path="/demo/:templateId" element={<DemoPage />} />
          <Route path="/frame" element={<FramePage />} />
          <Route path="/c/:uuid" element={<LegacyRedirect />} />
          <Route path="/upload/:token" element={<UploadPortalPage />} />
          {SchemaPlayground && <Route path="/dev/schema/:templateId?" element={<SchemaPlayground />} />}
          <Route path="/*" element={<RootSwitch />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
