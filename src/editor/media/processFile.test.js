import { describe, expect, test } from "vitest";
import { hasAlphaPixels } from "./processFile.js";

const rgba = (...alphas) => Uint8ClampedArray.from(alphas.flatMap((a) => [10, 20, 30, a]));

describe("transparencia al preparar fotos para subir", () => {
  test("un recorte (con píxeles transparentes) se detecta para no pasarlo a JPEG", () => {
    expect(hasAlphaPixels(rgba(255, 255, 0, 255))).toBe(true);
    expect(hasAlphaPixels(rgba(255, 128, 255))).toBe(true);
  });

  test("una foto opaca no se considera con transparencia", () => {
    expect(hasAlphaPixels(rgba(255, 255, 255, 255))).toBe(false);
    expect(hasAlphaPixels(rgba(251, 255))).toBe(false);
    expect(hasAlphaPixels(new Uint8ClampedArray(0))).toBe(false);
  });
});
