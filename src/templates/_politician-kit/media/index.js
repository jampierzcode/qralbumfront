// Ilustraciones de demostración de las tarjetas de político (candidato, equipo y un logo
// de partido inventado). Las genera scripts/politician-media.mjs. Viven aquí, en una
// carpeta "_", para que los registros de plantillas la ignoren.
import politicians from "./politicians.json";

const urls = {
  candidate: new URL("./candidate.webp", import.meta.url).href,
  "team-1": new URL("./team-1.webp", import.meta.url).href,
  "team-2": new URL("./team-2.webp", import.meta.url).href,
  "team-3": new URL("./team-3.webp", import.meta.url).href,
  "team-4": new URL("./team-4.webp", import.meta.url).href,
  "party-logo": new URL("./party-logo.webp", import.meta.url).href,
};

/** { media, refs } con los nombres pedidos; refs[name] = { assetId }. */
export function politicianMedia(names) {
  const media = {};
  const refs = {};
  for (const name of names) {
    const id = `demo-pol-${name}`;
    media[id] = { kind: "image", url: urls[name], ...politicians[name] };
    refs[name] = { assetId: id };
  }
  return { media, refs };
}
