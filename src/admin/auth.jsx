import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { adminApi, onUnauthorized } from "./api.js";

const AuthContext = createContext(null);

function readSession() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  return token && role ? { role, name: localStorage.getItem("userName") || "" } : null;
}

export function AuthProvider({ children }) {
  // Lectura síncrona: recargar la página no expulsa al login.
  const [user, setUser] = useState(readSession);

  const login = useCallback((token, profile) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", profile.role);
    localStorage.setItem("userName", profile.name || "");
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    ["token", "role", "userName"].forEach((k) => localStorage.removeItem(k));
    setUser(null);
  }, []);

  // El rol guardado no es fuente de verdad: se confirma con el servidor.
  useEffect(() => {
    if (!readSession()) return;
    adminApi
      .me()
      .then(({ user: me }) => {
        localStorage.setItem("userName", me.name || "");
        setUser(me);
      })
      .catch(() => {});
  }, []);

  useEffect(() => onUnauthorized(logout), [logout]);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/** Un referido usa el mismo panel, pero sólo ve lo suyo y no administra el catálogo. */
export function useIsReferral() {
  return useContext(AuthContext)?.user?.role === "referido";
}

/** Rutas sólo del dueño: un referido que llegue aquí (link guardado, sesión previa) vuelve a Inicio. */
export function RequireAdmin({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (user.role === "referido") return <Navigate to="/admin" replace />;
  return children;
}

export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
