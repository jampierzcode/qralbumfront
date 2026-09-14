import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mergeBoundValues, validateContent } from "../../../gift-core/index.js";
import { getTemplate } from "../../engine/registry.js";
import { adminApi, errorDetails, errorMessage } from "../api.js";

const SAVE_DELAY = 700;

function assetsMap(list = []) {
  return Object.fromEntries(list.map((a) => [a.id, a]));
}

/**
 * Estado compartido por el editor y los pasos del wizard:
 * carga del regalo, valores del schema, autoguardado, media y publicación.
 */
export function useGiftEditor(giftId) {
  const [gift, setGift] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [values, setValues] = useState(null);
  const [details, setDetails] = useState({ customerId: null, occasion: null });
  const [assets, setAssets] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [save, setSave] = useState({ status: "idle", error: null, savedAt: null });

  const dirty = useRef(false);
  const saving = useRef(null);
  const timer = useRef(null);
  const pendingRemovals = useRef(new Set());
  const latest = useRef({ values, details });
  latest.current = { values, details };

  const load = useCallback(async () => {
    try {
      const data = await adminApi.gift(giftId);
      setGift(data);
      setValues(mergeBoundValues(data.content, data));
      setDetails({ customerId: data.customerId, occasion: data.occasion });
      setAssets(assetsMap(data.media));
      setLoadError(null);
    } catch (err) {
      setLoadError({ status: err.response?.status, message: errorMessage(err) });
    }
  }, [giftId]);

  useEffect(() => {
    load();
  }, [load]);

  const template = gift ? getTemplate(gift.templateId) : null;

  const persist = useCallback(async () => {
    if (!dirty.current) return true;
    if (saving.current) {
      await saving.current;
      return persist();
    }
    dirty.current = false;
    setSave((s) => ({ ...s, status: "saving", error: null }));
    const { values: v, details: d } = latest.current;
    const run = (async () => {
      try {
        const updated = await adminApi.updateGift(giftId, { content: v, customerId: d.customerId, occasion: d.occasion });
        // No se pisan los valores locales (el usuario puede seguir escribiendo).
        setGift((g) => ({ ...g, ...updated, media: g.media }));
        setServerErrors([]);
        setSave({ status: dirty.current ? "pending" : "saved", error: null, savedAt: new Date() });
        const removals = [...pendingRemovals.current];
        pendingRemovals.current.clear();
        await Promise.all(removals.map((id) => adminApi.deleteMedia(giftId, id).catch(() => {})));
        return true;
      } catch (err) {
        dirty.current = true;
        setServerErrors(errorDetails(err));
        setSave({ status: "error", error: errorMessage(err, "No se pudo guardar."), savedAt: null });
        return false;
      } finally {
        saving.current = null;
      }
    })();
    saving.current = run;
    return run;
  }, [giftId]);

  const schedule = useCallback(() => {
    dirty.current = true;
    setSave((s) => ({ ...s, status: "pending" }));
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, SAVE_DELAY);
  }, [persist]);

  // Guardar antes de salir / cerrar pestaña.
  useEffect(() => {
    const beforeUnload = (e) => {
      if (dirty.current || saving.current) {
        persist();
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      clearTimeout(timer.current);
      if (dirty.current) persist();
    };
  }, [persist]);

  const setValue = useCallback(
    (key, value) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      schedule();
    },
    [schedule]
  );

  const setDetail = useCallback(
    (key, value) => {
      setDetails((prev) => ({ ...prev, [key]: value }));
      schedule();
    },
    [schedule]
  );

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    return persist();
  }, [persist]);

  const media = useMemo(
    () => ({
      assets,
      upload: async (file, options) => {
        const asset = await adminApi.uploadMedia(giftId, file, options);
        setAssets((prev) => ({ ...prev, [asset.id]: asset }));
        return asset;
      },
      // Se borra en el servidor después del próximo guardado (evita carreras con el autoguardado).
      remove: (assetId) => {
        pendingRemovals.current.add(assetId);
        schedule();
      },
    }),
    [assets, giftId, schedule]
  );

  const assetKinds = useMemo(() => Object.fromEntries(Object.entries(assets).map(([id, a]) => [id, { kind: a.kind }])), [assets]);

  const draftErrors = useMemo(() => {
    if (!template || !values) return [];
    return validateContent(template.schema, values, { mode: "draft", assets: assetKinds }).errors;
  }, [template, values, assetKinds]);

  const publishIssues = useCallback(() => {
    if (!template || !values) return [];
    return validateContent(template.schema, values, { mode: "publish", assets: assetKinds }).errors;
  }, [template, values, assetKinds]);

  const setStatus = useCallback(
    async (status) => {
      const ok = await flush();
      if (!ok) throw new Error("Guarda los cambios antes de continuar.");
      const updated = await adminApi.setGiftStatus(giftId, status);
      setGift((g) => ({ ...g, ...updated, media: g.media }));
      return updated;
    },
    [flush, giftId]
  );

  // Datos para el preview (mismo formato que la API pública).
  const previewGift = useMemo(() => {
    if (!gift || !values) return null;
    const { recipientName, senderName, ...content } = values;
    return { templateId: gift.templateId, recipientName, senderName, content };
  }, [gift, values]);

  return {
    gift,
    template,
    loadError,
    reload: load,
    values,
    setValue,
    details,
    setDetail,
    media,
    errors: serverErrors.length ? serverErrors : draftErrors,
    publishIssues,
    save,
    flush,
    setStatus,
    previewGift,
    setGift,
  };
}
