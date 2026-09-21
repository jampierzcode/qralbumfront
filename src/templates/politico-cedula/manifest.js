import { politicianManifest } from "../_politician-kit/fields.js";

export default politicianManifest({
  id: "politico-cedula",
  name: "Político · Cédula",
  description:
    "Tarjeta de presentación sobria, con la cédula de votación como portada: foto, logo del partido y la X que se dibuja sola sobre el número. Incluye día de votación, propuestas, equipo, campañas y links.",
  theme: { background: "#f6f2e9", foreground: "#14213d", accent: "#c8102e" },
});
