import { beforeEach, describe, expect, test } from "vitest";
import { createAudioController } from "./audio.js";

// Audio falso: registra play/pause como lo haría el navegador.
class FakeAudio {
  static instances = [];
  constructor() {
    this.paused = true;
    this.listeners = {};
    this.src = "";
    this.plays = 0;
    FakeAudio.instances.push(this);
  }
  addEventListener(type, fn) {
    (this.listeners[type] ||= []).push(fn);
  }
  emit(type) {
    (this.listeners[type] || []).forEach((fn) => fn());
  }
  setAttribute() {}
  removeAttribute(name) {
    if (name === "src") this.src = "";
  }
  load() {}
  play() {
    this.plays++;
    this.paused = false;
    this.emit("playing");
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
    this.emit("pause");
  }
}

beforeEach(() => {
  FakeAudio.instances = [];
  globalThis.Audio = FakeAudio;
});

describe("AudioController", () => {
  test("nunca reproduce antes de unlock() (sin autoplay)", () => {
    const audio = createAudioController();
    audio.setTrack({ src: "/song.mp3" });
    expect(FakeAudio.instances).toHaveLength(0);
    expect(audio.getState()).toMatchObject({ available: true, playing: false });

    audio.unlock();
    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0].src).toBe("/song.mp3");
    expect(audio.getState().playing).toBe(true);
  });

  test("pausa al ocultar la pestaña y retoma sólo si sonaba", () => {
    const audio = createAudioController();
    audio.setTrack({ src: "/song.mp3" });
    audio.unlock();
    audio.suspend();
    expect(audio.getState().playing).toBe(false);
    audio.resume();
    expect(audio.getState().playing).toBe(true);

    audio.pause();
    audio.suspend();
    audio.resume();
    expect(audio.getState().playing).toBe(false);
  });

  test("duck/unduck para videos y cambio de pista en vivo", () => {
    const audio = createAudioController();
    audio.setTrack({ src: "/a.mp3" });
    audio.unlock();
    audio.duck();
    expect(audio.getState().playing).toBe(false);
    audio.unduck();
    expect(audio.getState().playing).toBe(true);

    audio.setTrack({ src: "/b.mp3" });
    expect(FakeAudio.instances[0].src).toBe("/b.mp3");
    expect(audio.getState().playing).toBe(true);

    audio.setTrack(null);
    expect(audio.getState().available).toBe(false);
  });

  test("notifica a los suscriptores y se destruye limpio", () => {
    const audio = createAudioController();
    let calls = 0;
    const unsubscribe = audio.subscribe(() => calls++);
    audio.setTrack({ src: "/a.mp3" });
    audio.unlock();
    expect(calls).toBeGreaterThan(0);
    unsubscribe();
    audio.destroy();
    expect(FakeAudio.instances[0].paused).toBe(true);
  });
});
