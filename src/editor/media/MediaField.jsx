import { useRef, useState } from "react";
import { useUploader } from "./useUploader.js";
import { ACCEPT, LIMITS_MB } from "./processFile.js";

const COPY = {
  image: { add: "Elegir foto", replace: "Cambiar foto" },
  audio: { add: "Subir canción", replace: "Cambiar canción" },
  video: { add: "Subir video", replace: "Cambiar video" },
};

function formatDuration(sec) {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Un archivo (image | audio | video): subir, previsualizar, reemplazar, quitar, progreso y reintento. */
export default function MediaField({ field, value, onChange, media, disabled, inputId }) {
  const kind = field.type === "image" ? "image" : field.type;
  const input = useRef(null);
  const upload = useUploader(media);
  const [job, setJob] = useState(null); // { status, progress, error, file, previewUrl }

  const asset = value?.assetId ? media.assets[value.assetId] : null;

  async function start(file) {
    const previewUrl = kind === "image" ? URL.createObjectURL(file) : null;
    setJob({ status: "preparing", progress: 0, file, previewUrl });
    try {
      const created = await upload(file, kind, {
        onStage: (status) => setJob((j) => j && { ...j, status }),
        onProgress: (progress) => setJob((j) => j && { ...j, progress }),
      });
      if (value?.assetId) media.remove?.(value.assetId);
      onChange({ assetId: created.id });
      setJob(null);
    } catch (error) {
      if (error.name !== "AbortError") setJob({ status: "error", error: error.message, file, previewUrl });
    } finally {
      if (previewUrl) setTimeout(() => URL.revokeObjectURL(previewUrl), 30000);
    }
  }

  const busy = job && job.status !== "error";

  return (
    <div className={`sf-media sf-media--${kind}`}>
      {(asset || job?.previewUrl) && kind === "image" && (
        <img className="sf-media__image" src={job?.previewUrl || asset?.thumbUrl || asset?.url} alt="" />
      )}
      {asset && kind === "audio" && !busy && (
        <div className="sf-media__audio">
          <span className="sf-media__icon" aria-hidden="true">♪</span>
          <div className="sf-media__meta">
            <strong>{asset.originalName || "Canción"}</strong>
            {asset.durationSec ? <small>{formatDuration(asset.durationSec)}</small> : null}
          </div>
          <audio controls preload="none" src={asset.url} />
        </div>
      )}
      {asset && kind === "video" && !busy && <video className="sf-media__video" controls preload="metadata" src={asset.url} playsInline />}

      {busy && (
        <div className="sf-media__progress" aria-live="polite">
          <div className="sf-progress">
            <span style={{ width: `${Math.max(6, (job.progress || 0) * 100)}%` }} />
          </div>
          <small>{job.status === "preparing" ? "Preparando…" : `Subiendo ${Math.round((job.progress || 0) * 100)}%`}</small>
        </div>
      )}

      {job?.status === "error" && (
        <div className="sf-media__error" role="alert">
          <span>{job.error}</span>
          <button type="button" className="sf-link-btn" onClick={() => start(job.file)}>
            Reintentar
          </button>
        </div>
      )}

      {!disabled && !busy && (
        <div className="sf-media__actions">
          <button type="button" id={inputId} className={asset ? "sf-btn sf-btn--ghost" : "sf-add sf-add--wide"} onClick={() => input.current?.click()}>
            {!asset && <span aria-hidden="true">＋</span>}
            {asset ? COPY[kind].replace : COPY[kind].add}
          </button>
          {asset && (
            <button
              type="button"
              className="sf-btn sf-btn--ghost sf-btn--danger"
              onClick={() => {
                media.remove?.(value.assetId);
                onChange(null);
              }}
            >
              Quitar
            </button>
          )}
        </div>
      )}
      {!asset && !busy && <p className="sf-muted sf-small">Máximo {LIMITS_MB[kind]} MB.</p>}

      <input
        ref={input}
        type="file"
        accept={ACCEPT[kind]}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) start(file);
        }}
      />
    </div>
  );
}
