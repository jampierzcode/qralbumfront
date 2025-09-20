import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@ant-design/v5-patch-for-react-19";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ClientesPage from "./pages/ClientesPage";
import PublicPage from "./pages/PublicPage";
import Layouts from "./components/Layouts";
import PublicAlbumPage from "./pages/PageClientesV2";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layouts>
                  <Dashboard />
                </Layouts>
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

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

          <Route path="/:uuid" element={<PublicPage />} />
          <Route path="/c/:uuid" element={<PublicAlbumPage />} />

          <Route path="*" element={<h2>404 no encontrado</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
