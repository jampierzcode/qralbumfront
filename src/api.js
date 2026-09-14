import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({ baseURL: `${apiUrl}/api` });

const unauthorizedListeners = new Set();

// Registra un callback para cuando el servidor rechace la sesión. Devuelve la función para desuscribirse.
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin) {
      unauthorizedListeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  }
);

export default api;
