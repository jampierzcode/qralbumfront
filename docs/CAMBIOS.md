# Registro de cambios por fase — Web (qralbumfront)

Plan completo: `../IMPLEMENTATION_PLAN.md`

## Fase 0 — Seguridad

- **Recargar la página ya no expulsa al login:** `AuthContext` lee la sesión de forma síncrona (antes `PrivateRoute` redirigía antes de que un `useEffect` restaurara el estado).
- **El rol ya no se confía a `localStorage`:** al iniciar se confirma con `GET /api/auth/me`.
- **Sesión expirada o inválida:** el interceptor de axios detecta `401` y cierra la sesión (vuelve a `/login`).
- `PrivateRoute` ya no navega a `/unauthorized` (ruta inexistente).

Verificación (Chrome, 390×844): login → `/clientes` → recarga mantiene la ruta; token inválido → `/login`. Build CRA pasa.

## Fase 3a — Migración de Create React App a Vite

**Por qué (cambio respecto a la auditoría):** CRA está deprecado y **no permite importar código fuera de `src/`**. El motor necesita `gift-core/` compartido con el backend y el auto-registro de plantillas con `import.meta.glob`, que CRA no ofrece.

- `vite` 8 + `@vitejs/plugin-react`; `index.html` en la raíz (`lang="es"`, `viewport-fit=cover`).
- Archivos con JSX renombrados a `.jsx`; `src/index.js` → `src/main.jsx`.
- `REACT_APP_API_URL` → `VITE_API_URL` (vacío = mismo origen). En desarrollo Vite reenvía `/api` y `/media` al backend (`VITE_API_PROXY`), sin CORS.
- `package.json` con `"type": "module"`; configs de Tailwind/PostCSS pasan a `.cjs`.
- Eliminados: `react-scripts`, `web-vitals`, `@testing-library/*`, test roto de CRA, `App.css`, `logo.svg`, `UploadModal.js` (sin uso), archivos vacíos (`ClienteDetail.js`, `utils/audioPlayer.js`).
- `.env` deja de versionarse (existe `.env.example`).
- Scripts: `npm run dev` (puerto 3000), `npm run build`, `npm run preview`, `npm test` (Vitest).

Verificación: build OK; admin actual probado en Chrome (login, dashboard, clientes) sin errores de consola.
