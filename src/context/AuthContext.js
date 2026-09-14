import { createContext, useCallback, useEffect, useState } from "react";
import api, { onUnauthorized } from "../api";

export const AuthContext = createContext();

function readStoredSession() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token && role ? { role } : null;
}

export const AuthProvider = ({ children }) => {
  // Se lee de forma síncrona: antes el estado arrancaba en null y PrivateRoute
  // redirigía a /login en cada recarga, antes de que el efecto restaurara la sesión.
  const [user, setUser] = useState(readStoredSession);

  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setUser({ role });
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  }, []);

  // El rol guardado no es fuente de verdad: se confirma con el servidor.
  useEffect(() => {
    if (!readStoredSession()) return;
    api
      .get("/auth/me")
      .then((res) => setUser({ role: res.data.user.role, ...res.data.user }))
      .catch(() => {});
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
