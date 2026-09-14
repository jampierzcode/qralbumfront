# Registro de cambios por fase — Web (qralbumfront)

Plan completo: `../IMPLEMENTATION_PLAN.md`

## Fase 0 — Seguridad

- **Recargar la página ya no expulsa al login:** `AuthContext` lee la sesión de forma síncrona (antes `PrivateRoute` redirigía antes de que un `useEffect` restaurara el estado).
- **El rol ya no se confía a `localStorage`:** al iniciar se confirma con `GET /api/auth/me`.
- **Sesión expirada o inválida:** el interceptor de axios detecta `401` y cierra la sesión (vuelve a `/login`).
- `PrivateRoute` ya no navega a `/unauthorized` (ruta inexistente).

Verificación (Chrome, 390×844): login → `/clientes` → recarga mantiene la ruta; token inválido → `/login`. Build CRA pasa.
