import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Input, Segmented } from "antd";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Images,
} from "lucide-react";
import api from "../api";

/**
 * PublicAlbumPage (JavaScript)
 *
 * Versión en JS puro (sin TypeScript) que fusiona la animación
 * de “Flores Amarillas” con un CTA para abrir un álbum responsive
 * (fotos + videos) y un reproductor de audio tipo playlist.
 */
export default function PublicAlbumPage() {
  const { uuid } = useParams();

  // UI states
  const [showAlbum, setShowAlbum] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "photo" | "video"
  const [search, setSearch] = useState("");

  // Files
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audios, setAudios] = useState([]);

  // Audio player
  const audioRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (sec) => {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Load files (photos, videos, audios)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [rp, rv, ra] = await Promise.all([
          api.get(`/clients/${uuid}/files?type=photo`),
          api.get(`/clients/${uuid}/files?type=video`),
          api.get(`/clients/${uuid}/files?type=audio`),
        ]);
        if (!mounted) return;
        setPhotos(rp.data.map((x) => ({ ...x, type: "photo" })));
        setVideos(rv.data.map((x) => ({ ...x, type: "video" })));
        setAudios(ra.data.map((x) => ({ ...x, type: "audio" })));
        setCurrentIndex(0);
      } catch (e) {
        console.error("Error loading files", e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [uuid]);

  // Filtered gallery items
  const galleryItems = useMemo(() => {
    const base =
      filter === "all"
        ? [...photos, ...videos]
        : filter === "photo"
        ? photos
        : videos;
    const q = search.trim().toLowerCase();
    return q ? base.filter((f) => f.name.toLowerCase().includes(q)) : base;
  }, [photos, videos, filter, search]);

  // Current audio file
  const currentTrack = audios[currentIndex];

  // Handle switching track on index change
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    setProgress(0);
    setDuration(0);
    const el = audioRef.current;
    el.load();
    el.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentTrack?.url]);

  // Particles + falling flowers (ported)
  const particleContainerRef = useRef(null);
  const fallingContainerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    let lastParticle = 0;
    let lastFlower = 0;
    const particleInterval = 100;
    const flowerInterval = 250;

    const createParticle = (x, y) => {
      const container = particleContainerRef.current;
      if (!container) return;
      const el = document.createElement("div");
      el.className = "particle";
      const size = Math.random() * 6 + 2;
      const delay = Math.random() * 6;
      el.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;animation-delay:${delay}s;`;
      container.appendChild(el);
      const ttl = (6 + delay) * 1000;
      const t = window.setTimeout(() => el.remove(), ttl);
      el._t = t;
    };

    const createFallingFlower = () => {
      const container = fallingContainerRef.current;
      if (!container) return;
      const wrapper = document.createElement("div");
      wrapper.className = "falling-flower-wrapper";
      const flower = document.createElement("div");
      flower.className = "falling-flower";

      const animDuration = Math.random() * 8 + 7; // 7-15s
      const size = Math.random() * 30 + 10; // 10-40px

      wrapper.style.left = Math.random() * 95 + "vw";
      wrapper.style.animationDuration = `${animDuration}s`;
      flower.style.animationDuration = `${Math.random() * 2 + 3}s`;
      flower.style.width = `${size}px`;
      flower.style.height = `${size}px`;
      flower.style.filter = `blur(${Math.random() * 2}px)`;
      flower.style.opacity = `${Math.random() * 0.5 + 0.5}`;

      wrapper.appendChild(flower);
      container.appendChild(wrapper);
      const t = window.setTimeout(
        () => wrapper.remove(),
        animDuration * 1000 + 500
      );
      wrapper._t = t;
    };

    const loop = (ts) => {
      if (ts - lastParticle > particleInterval) {
        createParticle(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight
        );
        createParticle(
          window.innerWidth / 2 + (Math.random() - 0.5) * 400,
          window.innerHeight / 3 + (Math.random() - 0.5) * 300
        );
        lastParticle = ts;
      }
      if (ts - lastFlower > flowerInterval) {
        createFallingFlower();
        lastFlower = ts;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particleContainerRef.current
        ?.querySelectorAll(".particle")
        .forEach((n) => {
          const t = n._t;
          if (t) window.clearTimeout(t);
        });
      fallingContainerRef.current
        ?.querySelectorAll(".falling-flower-wrapper")
        .forEach((n) => {
          const t = n._t;
          if (t) window.clearTimeout(t);
        });
      particleContainerRef.current?.replaceChildren();
      fallingContainerRef.current?.replaceChildren();
    };
  }, []);

  // Controls
  const playNext = () =>
    setCurrentIndex((p) => (audios.length ? (p + 1) % audios.length : 0));
  const playPrev = () =>
    setCurrentIndex((p) =>
      audios.length ? (p === 0 ? audios.length - 1 : p - 1) : 0
    );

  const hasMedia = photos.length + videos.length > 0;

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-black overflow-hidden">
      {/* Background blur image */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="w-full h-full bg-cover bg-center opacity-20 blur-2xl"
          style={{ backgroundImage: "url(/assets/back.jpeg)" }}
        />
      </div>

      {/* Particles & flowers */}
      <div
        id="falling-flower-container"
        ref={fallingContainerRef}
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      />
      <div
        id="particle-container"
        ref={particleContainerRef}
        className="pointer-events-none absolute inset-0 -z-10"
      />

      {/* Title */}
      <h1 className="select-none text-yellow-300 text-center font-black drop-shadow-2xl tracking-wide absolute left-1/2 -translate-x-1/2 top-6 text-3xl sm:text-5xl">
        Flores Para Ti 🌻
      </h1>

      {/* CTA card */}
      {!showAlbum && (
        <div className="flex items-start justify-center min-h-[100vh]">
          <div className="backdrop-blur-md mt-[80px] bg-amber-900/30 border border-yellow-300/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center w-[90%] max-w-xl">
            <Images className="mx-auto mb-3" />

            <h2 className="text-yellow-200 text-xl font-semibold mb-2">
              Feliz día de las Flores Amarillas
            </h2>
            <p className="text-yellow-100/90 mb-6">
              Te regalo estas flores y un álbum con tus recuerdos favoritos ✨
            </p>
            <button
              onClick={() => setShowAlbum(true)}
              className="px-6 py-3 rounded-full bg-yellow-400 text-black font-bold shadow hover:scale-[1.02] active:scale-95 transition"
            >
              Ver álbum
            </button>
          </div>
        </div>
      )}

      {/* Album + Playlist */}
      {showAlbum && (
        <div className="relative z-10 px-4 sm:px-6 pt-28 pb-16">
          {/* Top controls */}
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <Segmented
              value={filter}
              onChange={(v) => setFilter(v)}
              options={[
                { label: "Todo", value: "all" },
                { label: "Fotos", value: "photo" },
                { label: "Videos", value: "video" },
              ]}
            />
            <Input.Search
              placeholder="Buscar en el álbum..."
              allowClear
              enterButton
              onSearch={setSearch}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Grid gallery */}
          <div className="mx-auto max-w-7xl mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryItems.map((f) => (
              <div
                key={`${f.type}-${f.id}`}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                {f.type === "photo" ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <video controls className="w-full h-64 object-cover">
                    <source src={f.url} />
                  </video>
                )}
                <div className="p-2 text-sm truncate">{f.name}</div>
              </div>
            ))}
            {!hasMedia && (
              <div className="col-span-full text-center text-yellow-200/80 py-10">
                Aún no hay fotos ni videos para mostrar.
              </div>
            )}
          </div>

          {/* Playlist */}
          <div className="mx-auto max-w-7xl mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="bg-white/95 rounded-xl shadow overflow-hidden max-h-[60vh] lg:col-span-1">
              <div className="px-4 py-3 border-b font-semibold">Playlist</div>
              <div
                className="divide-y overflow-y-auto"
                style={{ maxHeight: "calc(60vh - 48px)" }}
              >
                {audios.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                      i === currentIndex ? "bg-blue-50 font-semibold" : ""
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
                {audios.length === 0 && (
                  <div className="px-4 py-6 text-gray-500">
                    No hay pistas de audio.
                  </div>
                )}
              </div>
            </div>

            {/* Player */}
            <div className="lg:col-span-2">
              {currentTrack ? (
                <div className="bg-black text-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold mb-2 truncate">
                    {currentTrack.name}
                  </h3>
                  <p className="text-white/60 mb-4">
                    Reproduciendo {currentIndex + 1} de {audios.length}
                  </p>

                  {/* hidden audio element */}
                  <audio
                    ref={audioRef}
                    onTimeUpdate={() =>
                      setProgress(audioRef.current?.currentTime ?? 0)
                    }
                    onLoadedMetadata={() =>
                      setDuration(audioRef.current?.duration ?? 0)
                    }
                    onEnded={playNext}
                    className="hidden"
                  >
                    <source src={currentTrack.url} />
                  </audio>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <button
                      onClick={playPrev}
                      className="p-2 rounded-full hover:bg-gray-800"
                      aria-label="Anterior"
                    >
                      <SkipBack size={22} />
                    </button>

                    {isPlaying ? (
                      <button
                        onClick={() => {
                          audioRef.current?.pause();
                          setIsPlaying(false);
                        }}
                        className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full"
                        aria-label="Pausar"
                      >
                        <Pause size={26} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          audioRef.current?.play();
                          setIsPlaying(true);
                        }}
                        className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full"
                        aria-label="Reproducir"
                      >
                        <Play size={26} />
                      </button>
                    )}

                    <button
                      onClick={playNext}
                      className="p-2 rounded-full hover:bg-gray-800"
                      aria-label="Siguiente"
                    >
                      <SkipForward size={22} />
                    </button>

                    {isMuted ? (
                      <button
                        onClick={() => {
                          if (audioRef.current) audioRef.current.muted = false;
                          setIsMuted(false);
                        }}
                        className="p-2 rounded-full hover:bg-gray-800"
                        aria-label="Quitar silencio"
                      >
                        <VolumeX size={22} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (audioRef.current) audioRef.current.muted = true;
                          setIsMuted(true);
                        }}
                        className="p-2 rounded-full hover:bg-gray-800"
                        aria-label="Silenciar"
                      >
                        <Volume2 size={22} />
                      </button>
                    )}
                  </div>

                  {/* Progress */}
                  <input
                    type="range"
                    min={0}
                    max={isFinite(duration) ? duration : 0}
                    step={0.1}
                    value={progress}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (audioRef.current) audioRef.current.currentTime = val;
                      setProgress(val);
                    }}
                    className="w-full accent-blue-600"
                    aria-label="Progreso"
                  />
                  <div className="flex justify-between text-sm mt-2 font-mono">
                    <span>{formatTime(progress)}</span>
                    <span>
                      -{formatTime((duration || 0) - (progress || 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-black/70 text-white rounded-2xl p-6 text-center">
                  Selecciona una pista para reproducir
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(() => {
        const flowerIdx = [1, 2, 3, 4, 5, 6, 7];
        const angles = Array.from({ length: 12 }, (_, i) => i * 30);
        const lights = [1, 2, 3, 4, 5, 6, 7, 8];
        const lineLeaves = [1, 2, 3, 4];
        const grassIdx = Array.from({ length: 10 }, (_, i) => i + 1);
        return (
          <div className="flowers">
            {flowerIdx.map((i) => (
              <div key={i} className={`flower flower--${i}`}>
                <div
                  className={`flower__leafs${
                    i <= 5 ? ` flower__leafs--${i}` : ""
                  }`}
                >
                  {angles.map((a) => (
                    <div
                      key={a}
                      className="flower__leaf"
                      style={{
                        transform: `translate(-50%, -10%) rotate(${a}deg)`,
                      }}
                    />
                  ))}
                  <div className="flower__white-circle"></div>
                  {lights.map((n) => (
                    <div
                      key={n}
                      className={`flower__light flower__light--${n}`}
                    ></div>
                  ))}
                </div>
                <div className="flower__line">
                  {lineLeaves.map((n) => (
                    <div
                      key={n}
                      className={`flower__line__leaf flower__line__leaf--${n}`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}

            {/* grow-ans block */}
            <div className="grow-ans" style={{ ["--d"]: "1.2s" }}>
              <div className="flower__g-long">
                <div className="flower__g-long__top"></div>
                <div className="flower__g-long__bottom"></div>
              </div>
            </div>

            {/* growing grass x10 */}
            {grassIdx.map((gi) => (
              <div key={gi} className="growing-grass">
                <div className={`flower__grass flower__grass--${gi}`}>
                  <div className="flower__grass--top"></div>
                  <div className="flower__grass--bottom"></div>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className={`flower__grass__leaf flower__grass__leaf--${n}`}
                    ></div>
                  ))}
                  <div className="flower__grass__overlay"></div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Inline styles that mimic the original page (scoped globally) */}
      <style>{globalStyles}</style>
    </div>
  );
}

// === Global CSS (port of original) ===
const globalStyles = `
  *,*::after,*::before{box-sizing:border-box;margin:0;padding:0}
  :root{
    --dark-color:#000;--fl-speed:.8s;--speed-leaf:2s;--petal-gradient-start:#ff8c00;--petal-gradient-mid:#ffd700;--petal-gradient-end:#ffff00;--petal-shadow:rgba(255,215,0,.4);--center-color-1:#654321;--center-color-2:#8b4513;--center-color-3:#2f1b14;--center-shadow:rgba(139,69,19,.6);--stem-gradient-1:#2d5016;--stem-gradient-2:#4a7c23;--stem-gradient-3:#6b8e23;--leaf-gradient-1:rgba(45,80,22,.6);--leaf-gradient-2:#4a7c23;--leaf-gradient-3:#6b8e23;--grass-color:#4a7c23;--light-seeds-1:#8b4513;--light-seeds-2:#654321;--light-seeds-shadow:rgba(139,69,19,.8)
  }
  #particle-container{position:absolute;inset:0;pointer-events:none;z-index:10}
  .particle{position:absolute;background-color:rgba(255,221,0,.8);border-radius:50%;opacity:0;box-shadow:0 0 8px rgba(255,221,0,.9),0 0 12px rgba(255,221,0,.5);animation:particle-rise 6s ease-out infinite}
  @keyframes particle-rise{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-30vh) scale(0);opacity:0}}
  #falling-flower-container{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}
  .falling-flower-wrapper{position:absolute;top:-50px;animation:fallDown linear forwards;will-change:transform}
  .falling-flower{position:relative;background-image:url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path fill="%23FFD700" d="M50 0 L58.7 34.5 L90.5 25 L65.5 41.3 L99 61.8 L61.8 61.8 L75 90.5 L50 67 L25 90.5 L38.2 61.8 L1 61.8 L34.5 41.3 L9.5 25 L41.3 34.5 Z"/><circle cx="50" cy="50" r="20" fill="%23654321"/></svg>');background-size:contain;background-repeat:no-repeat;animation:sway ease-in-out infinite alternate;will-change:transform}
  @keyframes fallDown{from{transform:translateY(0);opacity:1}to{transform:translateY(110vh);opacity:0}}
  @keyframes sway{from{transform:translateX(-25px) rotate(-45deg)}to{transform:translateX(25px) rotate(45deg)}}

  .flowers{position:relative; transform: scale(0.7); z-index: 1}
  .flower{position:absolute;bottom:10vmin;transform-origin:bottom center;z-index:50;will-change:transform}
  .flower--1{left:10%;animation:moving-flower-1 4s linear infinite}
  .flower--2{left:50%;transform:rotate(20deg);animation:moving-flower-2 4s linear infinite}
  .flower--3{left:40%;transform:rotate(-15deg);animation:moving-flower-3 4s linear infinite}
  .flower--4{left:-25%;z-index:-6;transform:rotate(10deg);animation:moving-flower-4 3.5s linear infinite}
  .flower--5{left:75%;z-index:-7;transform:rotate(-25deg);animation:moving-flower-5 4.5s linear infinite}
  .flower--6{left:-40%;z-index:-8;transform:rotate(-30deg);animation:moving-flower-6 5s linear infinite}
  .flower--7{left:90%;z-index:-9;transform:rotate(15deg);animation:moving-flower-7 4.8s linear infinite}
  .flower__leafs{position:relative;animation:blooming-flower 2s backwards}
  .flower__leaf{position:absolute;bottom:0;left:50%;width:23vmin;height:6vmin;border-radius:10% 100% 10% 100%;background-image:linear-gradient(to top,var(--petal-gradient-start),var(--petal-gradient-mid),var(--petal-gradient-end));transform-origin:bottom center;opacity:.95;box-shadow:inset 0 0 1vmin rgba(255,255,255,.7),0 0 3vmin var(--petal-shadow);z-index:2}
  .flower__white-circle{position:absolute;left:-4vmin;top:-4vmin;width:10vmin;height:10vmin;border-radius:50%;background-image:radial-gradient(circle at 30% 30%,var(--center-color-1),var(--center-color-2),var(--center-color-3));box-shadow:inset 0 0 2vmin rgba(0,0,0,.8),0 0 1vmin var(--center-shadow)}
  .flower__white-circle::after{content:"";position:absolute;left:46%;top:31%;transform:translate(-50%,-50%);width:80%;height:80%;border-radius:inherit;background-image:repeating-conic-gradient(from 0deg,var(--center-color-3) 0 15deg,var(--center-color-1) 15deg 30deg),radial-gradient(circle at center,var(--center-color-2),var(--center-color-1))}
  .flower__line{height:55vmin;width:2vmin;background-image:linear-gradient(to left,rgba(0,0,0,.3),transparent,rgba(255,255,255,.2)),linear-gradient(to top,transparent 10%,var(--stem-gradient-1),var(--stem-gradient-2),var(--stem-gradient-3));box-shadow:inset 0 0 2px rgba(0,0,0,.7);animation:grow-flower-tree 4s backwards}
  .flower__line__leaf{--w:8vmin;--h:calc(var(--w) + 3vmin);position:absolute;top:20%;left:90%;width:var(--w);height:var(--h);border-top-right-radius:var(--h);border-bottom-left-radius:var(--h);background-image:linear-gradient(to top,var(--leaf-gradient-1),var(--leaf-gradient-2),var(--leaf-gradient-3));box-shadow:inset 0 0 1vmin rgba(0,0,0,.3)}
  .flower__line__leaf--3,.flower__line__leaf--4{border-top-right-radius:0;border-bottom-left-radius:0;border-top-left-radius:var(--h);border-bottom-right-radius:var(--h);left:-460%;top:12%}
  .flower__light{position:absolute;bottom:0;width:.8vmin;height:.8vmin;background-color:var(--light-seeds-1);border-radius:50%;filter:blur(.1vmin);animation:sunflower-seeds 6s linear infinite backwards;box-shadow:0 0 1vmin var(--light-seeds-shadow)}

  @keyframes moving-flower-1{from,to{transform:rotate(2deg)}50%{transform:rotate(-2deg)}}
  @keyframes moving-flower-2{from,to{transform:rotate(18deg)}50%{transform:rotate(14deg)}}
  @keyframes moving-flower-3{from,to{transform:rotate(-18deg)}50%{transform:rotate(-20deg) rotateY(-10deg)}}
  @keyframes moving-flower-4{from,to{transform:rotate(9deg)}50%{transform:rotate(12deg) rotateY(9deg)}}
  @keyframes moving-flower-5{from,to{transform:rotate(-5deg)}50%{transform:rotate(-8deg) rotateY(5deg)}}
  @keyframes moving-flower-6{from,to{transform:rotate(-20deg)}50%{transform:rotate(-24deg) rotateY(-8deg)}}
  @keyframes moving-flower-7{from,to{transform:rotate(22deg)}50%{transform:rotate(25deg) rotateY(10deg)}}
  @keyframes blooming-flower{from{transform:scale(0)}}
  @keyframes grow-flower-tree{from{height:0;border-radius:1vmin}}
`;
