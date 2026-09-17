import axios from "axios";
import { uploadWithProgress } from "../lib/upload.js";

export const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api`;
const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);

const api = axios.create({ baseURL: API_BASE });

const unauthorizedListeners = new Set();
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLogin) unauthorizedListeners.forEach((l) => l());
    return Promise.reject(error);
  }
);

/** Mensaje humano de un error de API. */
export function errorMessage(error, fallback = "Ocurrió un error. Intenta nuevamente.") {
  if (!error?.response) return error?.message && !/Network Error/.test(error.message) ? error.message : "Sin conexión con el servidor.";
  return error.response.data?.error || fallback;
}

export function errorDetails(error) {
  return error?.response?.data?.details?.errors || [];
}

const data = (promise) => promise.then((r) => r.data);

export const adminApi = {
  login: (body) => data(api.post("/auth/login", body)),
  me: () => data(api.get("/auth/me")),
  dashboard: () => data(api.get("/admin/dashboard")),

  customers: (params) => data(api.get("/admin/customers", { params })),
  customer: (id) => data(api.get(`/admin/customers/${id}`)),
  createCustomer: (body) => data(api.post("/admin/customers", body)),
  updateCustomer: (id, body) => data(api.patch(`/admin/customers/${id}`, body)),

  gifts: (params) => data(api.get("/admin/gifts", { params })),
  gift: (id) => data(api.get(`/admin/gifts/${id}`)),
  createGift: (body) => data(api.post("/admin/gifts", body)),
  updateGift: (id, body) => data(api.patch(`/admin/gifts/${id}`, body)),
  setGiftStatus: (id, status) => data(api.post(`/admin/gifts/${id}/status`, { status })),
  duplicateGift: (id) => data(api.post(`/admin/gifts/${id}/duplicate`)),
  deleteMedia: (giftId, assetId) => api.delete(`/admin/gifts/${giftId}/media/${assetId}`),
  uploadMedia: (giftId, file, { kind, durationSec, onProgress, signal }) => {
    const form = new FormData();
    form.append("kind", kind);
    if (durationSec) form.append("durationSec", String(durationSec));
    form.append("file", file, file.name);
    return uploadWithProgress(`${API_BASE}/admin/gifts/${giftId}/media`, form, {
      headers: { Authorization: `Bearer ${getToken()}` },
      onProgress,
      signal,
    });
  },

  submitGift: (giftId, body) => data(api.post(`/admin/gifts/${giftId}/submit`, body)),
  uploadPaymentProof: (giftId, file) => {
    const form = new FormData();
    form.append("kind", "image");
    form.append("file", file, file.name);
    return uploadWithProgress(`${API_BASE}/admin/gifts/${giftId}/payment-proof`, form, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },
  paymentProof: (giftId) => data(api.get(`/admin/gifts/${giftId}/payment-proof`)),
  reviewGift: (giftId, body) => data(api.post(`/admin/gifts/${giftId}/review`, body)),
  setGiftPaid: (giftId, paid) => data(api.post(`/admin/gifts/${giftId}/paid`, { paid })),

  referrals: () => data(api.get("/admin/referrals")),
  createReferral: (body) => data(api.post("/admin/referrals", body)),
  updateReferral: (id, body) => data(api.patch(`/admin/referrals/${id}`, body)),
  referralAccount: (id) => data(api.get(`/admin/referrals/${id}/account`)),
  myAccount: () => data(api.get("/admin/account")),

  contentRequests: (giftId) => data(api.get(`/admin/gifts/${giftId}/content-requests`)),
  createContentRequest: (giftId, body) => data(api.post(`/admin/gifts/${giftId}/content-requests`, body)),
  revokeContentRequest: (id) => data(api.post(`/admin/content-requests/${id}/revoke`)),

  templates: () => data(api.get("/admin/templates")),
  updateTemplate: (templateId, body) => data(api.patch(`/admin/templates/${templateId}`, body)),
  reorderTemplates: (templateIds) => data(api.put("/admin/templates/order", { templateIds })),

  collections: () => data(api.get("/admin/collections")),
  createCollection: (body) => data(api.post("/admin/collections", body)),
  updateCollection: (id, body) => data(api.patch(`/admin/collections/${id}`, body)),
  reorderCollections: (ids) => data(api.put("/admin/collections/order", { ids })),
  setCollectionTemplates: (id, templateIds) => data(api.put(`/admin/collections/${id}/templates`, { templateIds })),
  uploadCollectionCover: (id, file) => {
    const form = new FormData();
    form.append("file", file, file.name);
    return data(api.post(`/admin/collections/${id}/cover`, form));
  },
};

export default api;
