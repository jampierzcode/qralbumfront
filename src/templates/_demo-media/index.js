// Medios de demostración propios (generados por scripts/generate-demo-media.mjs).
// La carpeta empieza con "_" para que los registros de plantillas la ignoren.
import photos from "./photos.json";

const urls = {
  sunset: new URL("./sunset.webp", import.meta.url).href,
  sunflowers: new URL("./sunflowers.webp", import.meta.url).href,
  "city-lights": new URL("./city-lights.webp", import.meta.url).href,
  coffee: new URL("./coffee.webp", import.meta.url).href,
  mountains: new URL("./mountains.webp", import.meta.url).href,
  stars: new URL("./stars.webp", import.meta.url).href,
  blossoms: new URL("./blossoms.webp", import.meta.url).href,
  beach: new URL("./beach.webp", import.meta.url).href,
  cake: new URL("./cake.webp", import.meta.url).href,
  balloons: new URL("./balloons.webp", import.meta.url).href,
  party: new URL("./party.webp", import.meta.url).href,
  gift: new URL("./gift.webp", import.meta.url).href,
  kid: new URL("./kid.webp", import.meta.url).href,
  couple: new URL("./couple.webp", import.meta.url).href,
  rings: new URL("./rings.webp", import.meta.url).href,
  greenery: new URL("./greenery.webp", import.meta.url).href,
  bouquet: new URL("./bouquet.webp", import.meta.url).href,
  "navy-blooms": new URL("./navy-blooms.webp", import.meta.url).href,
  altar: new URL("./altar.webp", import.meta.url).href,
  dance: new URL("./dance.webp", import.meta.url).href,
};

const songUrl = new URL("./music-box.mp3", import.meta.url).href;

/** Construye { media, refs } para el demo de una plantilla a partir de nombres de fotos. */
export function demoMedia(photoNames, { withSong = true } = {}) {
  const media = {};
  const refs = photoNames.map((name) => {
    const id = `demo-${name}`;
    media[id] = { kind: "image", url: urls[name], ...photos[name] };
    return { assetId: id };
  });
  let song = null;
  if (withSong) {
    media["demo-song"] = { kind: "audio", url: songUrl, durationSec: 27 };
    song = { assetId: "demo-song" };
  }
  return { media, refs, song };
}
