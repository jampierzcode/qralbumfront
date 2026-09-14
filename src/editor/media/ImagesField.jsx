import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useUploader } from "./useUploader.js";
import { ACCEPT } from "./processFile.js";

let keySeed = 0;
const newKey = () => `local-${Date.now()}-${keySeed++}`;
const signature = (refs = []) => refs.map((r) => r?.assetId).join("|");
const isTouchDevice = () => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

function fromValue(value = [], assets = {}) {
  return value
    .filter((ref) => ref?.assetId)
    .map((ref) => ({ key: ref.assetId, assetId: ref.assetId, status: "done", asset: assets[ref.assetId] || null }));
}

function Tile({ item, index, onRemove, onRetry, onReplace, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled: disabled || item.status !== "done",
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const src = item.previewUrl || item.asset?.thumbUrl || item.asset?.url;
  const busy = item.status === "preparing" || item.status === "uploading";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`sf-tile ${isDragging ? "is-dragging" : ""} ${item.status === "error" ? "is-error" : ""}`}
      {...attributes}
      {...listeners}
      aria-label={`Foto ${index + 1}`}
    >
      {src ? <img src={src} alt="" draggable={false} /> : <div className="sf-tile__empty" />}
      {index === 0 && item.status === "done" && <span className="sf-tile__badge">Portada</span>}

      {busy && (
        <div className="sf-tile__overlay" aria-live="polite">
          <div className="sf-progress" role="progressbar" aria-valuenow={Math.round((item.progress || 0) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${Math.max(6, (item.progress || 0) * 100)}%` }} />
          </div>
          <small>{item.status === "preparing" ? "Preparando…" : `${Math.round((item.progress || 0) * 100)}%`}</small>
        </div>
      )}

      {item.status === "error" && (
        <button type="button" className="sf-tile__overlay sf-tile__retry" onClick={() => onRetry(item)} onPointerDown={(e) => e.stopPropagation()}>
          <strong>No se subió</strong>
          <small>{item.error}</small>
          <span>Reintentar</span>
        </button>
      )}

      {!busy && (
        <div className="sf-tile__actions" onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
          {item.status === "done" && (
            <button type="button" className="sf-icon-btn" onClick={() => onReplace(item)} aria-label={`Reemplazar foto ${index + 1}`} title="Reemplazar">
              ⟲
            </button>
          )}
          <button type="button" className="sf-icon-btn" onClick={() => onRemove(item)} aria-label={`Eliminar foto ${index + 1}`} title="Eliminar">
            ✕
          </button>
        </div>
      )}
    </li>
  );
}

/**
 * Fotos múltiples: selección múltiple, cámara, preview inmediato, compresión,
 * progreso individual, reintento, reordenar (mantener presionado en touch,
 * arrastrar con mouse, flechas con teclado), reemplazar y eliminar.
 */
export default function ImagesField({ field, value, onChange, media, disabled, inputId }) {
  const max = field.max || 12;
  const [items, setItems] = useState(() => fromValue(value, media.assets));
  const [notice, setNotice] = useState("");
  const lastEmitted = useRef(signature(value));
  const addInput = useRef(null);
  const cameraInput = useRef(null);
  const replaceInput = useRef(null);
  const replacing = useRef(null);
  const upload = useUploader(media);
  const touch = useMemo(isTouchDevice, []);

  // Cambios externos (carga inicial, otro guardado) → reconstruir conservando subidas en curso.
  useEffect(() => {
    const incoming = signature(value);
    if (incoming === lastEmitted.current) return;
    lastEmitted.current = incoming;
    setItems((prev) => [...fromValue(value, media.assets), ...prev.filter((i) => i.status !== "done")]);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Completa la vista de assets que llegaron después.
  useEffect(() => {
    setItems((prev) => prev.map((i) => (i.assetId && !i.asset && media.assets[i.assetId] ? { ...i, asset: media.assets[i.assetId] } : i)));
  }, [media.assets]);

  // Emite el valor (sólo fotos ya subidas, en el orden visible).
  useEffect(() => {
    const refs = items.filter((i) => i.status === "done" && i.assetId).map((i) => ({ assetId: i.assetId }));
    const sig = signature(refs);
    if (sig !== lastEmitted.current) {
      lastEmitted.current = sig;
      onChange(refs);
    }
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => items.forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl)),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const patch = (key, changes) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...changes } : i)));

  async function run(item) {
    try {
      const asset = await upload(item.file, "image", {
        onStage: (status) => patch(item.key, { status, progress: 0, error: null }),
        onProgress: (progress) => patch(item.key, { progress }),
      });
      if (item.replaces) media.remove?.(item.replaces);
      patch(item.key, { status: "done", assetId: asset.id, asset, progress: 1, file: null });
    } catch (error) {
      if (error.name === "AbortError") return;
      patch(item.key, { status: "error", error: error.message });
    }
  }

  function addFiles(fileList) {
    const files = [...fileList];
    if (!files.length) return;
    const slots = max - items.length;
    if (slots <= 0) {
      setNotice(`Ya tienes ${max} fotos, el máximo. Elimina alguna para agregar otra.`);
      return;
    }
    const accepted = files.slice(0, slots);
    setNotice(files.length > slots ? `Se agregaron ${accepted.length} de ${files.length}: el máximo es ${max} fotos.` : "");
    const created = accepted.map((file) => ({
      key: newKey(),
      file,
      status: "preparing",
      progress: 0,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...created]);
    created.forEach(run);
  }

  function replaceWith(fileList) {
    const file = fileList?.[0];
    const target = replacing.current;
    replacing.current = null;
    if (!file || !target) return;
    const item = { key: newKey(), file, status: "preparing", progress: 0, previewUrl: URL.createObjectURL(file), replaces: target.assetId };
    setItems((prev) => prev.map((i) => (i.key === target.key ? item : i)));
    run(item);
  }

  function remove(item) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    setItems((prev) => prev.filter((i) => i.key !== item.key));
    if (item.assetId) media.remove?.(item.assetId);
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.key === active.id);
      const to = prev.findIndex((i) => i.key === over.id);
      return arrayMove(prev, from, to);
    });
  };

  const done = items.filter((i) => i.status === "done").length;
  const full = items.length >= max;

  return (
    <div className="sf-images">
      <div className="sf-images__head">
        <span className="sf-count" aria-live="polite">
          {done}/{max}
          {field.min ? <span className="sf-muted"> · mínimo {field.min}</span> : null}
        </span>
        {items.length > 1 && <span className="sf-muted sf-hint">{touch ? "Mantén presionada una foto para ordenar" : "Arrastra para ordenar"}</span>}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.key)} strategy={rectSortingStrategy}>
          <ul className="sf-grid">
            {items.map((item, index) => (
              <Tile
                key={item.key}
                item={item}
                index={index}
                disabled={disabled}
                onRemove={remove}
                onRetry={(i) => run({ ...i, status: "preparing" })}
                onReplace={(i) => {
                  replacing.current = i;
                  replaceInput.current?.click();
                }}
              />
            ))}
            {!full && !disabled && (
              <li className="sf-grid__add">
                <button type="button" id={inputId} className="sf-add" onClick={() => addInput.current?.click()}>
                  <span aria-hidden="true">＋</span>
                  {items.length ? "Agregar" : "Agregar fotos"}
                </button>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>

      {touch && !full && !disabled && (
        <button type="button" className="sf-link-btn" onClick={() => cameraInput.current?.click()}>
          Tomar una foto con la cámara
        </button>
      )}
      {notice && <p className="sf-notice" role="status">{notice}</p>}

      <input ref={addInput} type="file" accept={ACCEPT.image} multiple hidden onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
      <input ref={cameraInput} type="file" accept={ACCEPT.image} capture="environment" hidden onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
      <input ref={replaceInput} type="file" accept={ACCEPT.image} hidden onChange={(e) => (replaceWith(e.target.files), (e.target.value = ""))} />
    </div>
  );
}
