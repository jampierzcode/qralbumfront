import { politicianSchema } from "../_politician-kit/fields.js";

// Azul con acento ámbar: los colores por defecto; cada partido pone los suyos.
// "background": la portada admite una foto de fondo que se mezcla (multiplicar) con el color del partido.
export default politicianSchema({ primary: "#0b57d0", accent: "#ffb300", extras: ["background"] });
