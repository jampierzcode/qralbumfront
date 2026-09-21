import { politicianSchema } from "../_politician-kit/fields.js";

// Carmesí con acento azul marino, sobre papel: cada partido pone sus colores.
// "ballot": interruptor para mostrar o no la foto del candidato dentro de la cédula
// (las cédulas de las elecciones regionales y municipales 2026 no llevan foto).
export default politicianSchema({ primary: "#c8102e", accent: "#14213d", extras: ["ballot"] });
