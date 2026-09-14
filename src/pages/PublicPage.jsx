import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api";
import { Segmented, Input } from "antd";
import Slider from "react-slick";

export default function PublicPage() {
  const { uuid } = useParams();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [type, setType] = useState("photo");
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (sec) =>
    new Date(sec * 1000).toISOString().substring(14, 19);

  useEffect(() => {
    const load = async () => {
      const r = await api.get(`/clients/${uuid}/files?type=${type}`);
      setFiles(r.data);
      setFilteredFiles(r.data);
      setCurrentIndex(0);
    };
    load();
  }, [type, uuid]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredFiles(files);
    } else {
      setFilteredFiles(
        files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    setCurrentIndex(0);
  }, [search, files]);

  const currentFile = filteredFiles[currentIndex];

  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredFiles.length);
  };

  const playPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? filteredFiles.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (type === "audio" && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [currentFile]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Segmented
        value={type}
        onChange={setType}
        options={[
          { label: "Fotos", value: "photo" },
          { label: "Videos", value: "video" },
          { label: "Audio", value: "audio" },
        ]}
        className="mb-6"
      />

      {(type === "photo" || type === "video") && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((f) =>
            type === "photo" ? (
              <div
                key={f.id}
                className="overflow-hidden rounded-lg shadow bg-white"
              >
                <img
                  src={f.url}
                  alt={f.name}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ) : (
              <div
                key={f.id}
                className="overflow-hidden rounded-lg shadow bg-white"
              >
                <video controls className="w-full h-auto object-cover">
                  <source src={f.url} />
                </video>
              </div>
            )
          )}
        </div>
      )}
      {type === "audio" && (
        <div className="max-w-4xl mx-auto mt-8">
          {/* Buscador */}
          <Input.Search
            placeholder="Buscar canción..."
            allowClear
            enterButton
            onSearch={setSearch}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-6"
          />

          {/* Lista de pistas */}
          <div className="bg-white rounded-lg shadow divide-y overflow-y-auto max-h-60">
            {filteredFiles.map((f, i) => (
              <button
                key={f.id}
                className={`w-full text-left p-4 hover:bg-gray-100 focus:outline-none transition
            ${i === currentIndex ? "bg-blue-50 font-semibold" : ""}`}
                onClick={() => setCurrentIndex(i)}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Reproductor */}
          {currentFile && (
            <div className="mt-8 bg-black text-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 truncate">
                {currentFile.name}
              </h3>

              {/* audio tag invisible (solo backend) */}
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
                <source src={currentFile.url} />
              </audio>

              {/* Controles */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  onClick={playPrev}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <SkipBack size={24} />
                </button>

                {isPlaying ? (
                  <button
                    onClick={() => {
                      audioRef.current?.pause();
                      setIsPlaying(false);
                    }}
                    className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Pause size={28} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      audioRef.current?.play();
                      setIsPlaying(true);
                    }}
                    className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full"
                  >
                    <Play size={28} />
                  </button>
                )}

                <button
                  onClick={playNext}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <SkipForward size={24} />
                </button>

                {/* Mute / unmute opcional */}
                {isMuted ? (
                  <button
                    onClick={() => {
                      audioRef.current.muted = false;
                      setIsMuted(false);
                    }}
                    className="p-2 rounded-full hover:bg-gray-800"
                  >
                    <VolumeX size={24} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      audioRef.current.muted = true;
                      setIsMuted(true);
                    }}
                    className="p-2 rounded-full hover:bg-gray-800"
                  >
                    <Volume2 size={24} />
                  </button>
                )}
              </div>

              {/* Barra de progreso */}
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={progress}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  audioRef.current.currentTime = val;
                  setProgress(val);
                }}
                className="w-full accent-blue-600"
              />

              {/* Tiempos */}
              <div className="flex justify-between text-sm mt-2 font-mono">
                <span>{formatTime(progress)}</span>
                <span>-{formatTime(duration - progress)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
