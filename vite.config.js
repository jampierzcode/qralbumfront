import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.VITE_API_PROXY || "http://localhost:3001";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // /api y /media se reenvían al backend: mismo origen en desarrollo (sin CORS).
    proxy: {
      "/api": API_TARGET,
      "/media": API_TARGET,
    },
  },
  preview: {
    port: 3000,
    proxy: { "/api": API_TARGET, "/media": API_TARGET },
  },
  test: {
    include: ["gift-core/**/*.test.js", "src/**/*.test.{js,jsx}"],
    environment: "node",
  },
});
