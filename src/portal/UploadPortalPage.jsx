import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getSteps, validateContent } from "../../gift-core/index.js";
import { getTemplate } from "../engine/registry.js";
import SchemaForm from "../editor/SchemaForm.jsx";
import { ApiError, publicRequest } from "../lib/publicApi.js";
import { uploadWithProgress } from "../lib/upload.js";
import "./portal.css";

const API = `${import.meta.env.VITE_API_URL || ""}/api/portal`;
const SAVE_DELAY = 800;

function Screen({ children, className = "" }) {
  return (
    <div className={`pt ${className}`}>
      <div className="pt__inner">{children}</div>
    </div>
  );
}

function Heart() {
  return (
    <svg className="pt-heart" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.2.3.8.3 1 0 .7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

/** /upload/:token — el comprador completa el contenido de SU regalo. Sin cuenta, sin datos internos. */
export default function UploadPortalPage() {
  const { token } = useParams();
  const [state, setState] = useState({ status: "loading" });
  const [values, setValues] = useState({});
  const [assets, setAssets] = useState({});
  const [stage, setStage] = useState("intro"); // intro | steps | done
  const [stepIndex, setStepIndex] = useState(0);
  const [save, setSave] = useState("idle");
  const [issues, setIssues] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const dirty = useRef(false);
  const timer = useRef(null);
  const saving = useRef(null);
  const latestValues = useRef(values);
  latestValues.current = values;
  const pendingRemovals = useRef(new Set());

  useEffect(() => {
    document.title = "Completa tu regalo";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    publicRequest(`/portal/${encodeURIComponent(token)}`)
      .then((data) => {
        setState({ status: "ready", data });
        setValues(data.values);
        setAssets(Object.fromEntries(data.media.map((a) => [a.id, a])));
        if (data.status === "submitted") setStage("done");
      })
      .catch((error) => setState({ status: "error", error }));
  }, [token]);

  const data = state.data;
  const template = data ? getTemplate(data.template.id) : null;
  const steps = useMemo(() => (template ? getSteps(template.schema, { keys: data.allowedFields }) : []), [template, data]);

  const persist = useCallback(async () => {
    if (!dirty.current) return true;
    if (saving.current) {
      await saving.current;
      return persist();
    }
    dirty.current = false;
    setSave("saving");
    const run = (async () => {
      try {
        await publicRequest(`/portal/${encodeURIComponent(token)}/content`, { method: "PATCH", body: { values: latestValues.current } });
        const removals = [...pendingRemovals.current];
        pendingRemovals.current.clear();
        await Promise.all(removals.map((id) => publicRequest(`/portal/${encodeURIComponent(token)}/media/${id}`, { method: "DELETE" }).catch(() => {})));
        setSave(dirty.current ? "pending" : "saved");
        return true;
      } catch (error) {
        dirty.current = true;
        setSave("error");
        if (error.details?.errors) setIssues(error.details.errors);
        if (error.status === 410) setState({ status: "error", error });
        return false;
      } finally {
        saving.current = null;
      }
    })();
    saving.current = run;
    return run;
  }, [token]);

  const schedule = useCallback(() => {
    dirty.current = true;
    setSave("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(persist, SAVE_DELAY);
  }, [persist]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const media = useMemo(
    () => ({
      assets,
      upload: async (file, { kind, durationSec, onProgress, signal }) => {
        const form = new FormData();
        form.append("kind", kind);
        if (durationSec) form.append("durationSec", String(durationSec));
        form.append("file", file, file.name);
        const asset = await uploadWithProgress(`${API}/${encodeURIComponent(token)}/media`, form, { onProgress, signal });
        setAssets((prev) => ({ ...prev, [asset.id]: asset }));
        return asset;
      },
      remove: (assetId) => {
        pendingRemovals.current.add(assetId);
        schedule();
      },
    }),
    [assets, token, schedule]
  );

  const assetKinds = useMemo(() => Object.fromEntries(Object.entries(assets).map(([id, a]) => [id, { kind: a.kind }])), [assets]);
  const liveErrors = useMemo(
    () => (template ? validateContent(template.schema, values, { mode: "draft", keys: data.allowedFields, assets: assetKinds }).errors : []),
    [template, values, data, assetKinds]
  );

  if (state.status === "loading") {
    return (
      <Screen className="pt--center">
        <div className="pt-spinner" role="status" aria-label="Cargando" />
      </Screen>
    );
  }

  if (state.status === "error" || !template) {
    const error = state.error || new ApiError(404, "Este link no es válido.");
    return (
      <Screen className="pt--center">
        <Heart />
        <h1 className="pt-title">{error.status === 410 ? "Este link ya no está disponible" : error.status === 0 ? "Sin conexión" : "No encontramos este link"}</h1>
        <p className="pt-text">{error.message}</p>
        {error.status === 0 && (
          <button type="button" className="pt-btn pt-btn--primary" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        )}
      </Screen>
    );
  }

  const name = data.gift.recipientName;

  if (stage === "done") {
    return (
      <Screen className="pt--center pt--done">
        <div className="pt-burst" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} style={{ "--i": i }} />
          ))}
        </div>
        <Heart />
        <h1 className="pt-title">¡Listo! 💛</h1>
        <p className="pt-text">Recibimos todo para preparar {name ? `el regalo de ${name}` : "tu regalo"}. Te avisaremos cuando esté listo.</p>
        <p className="pt-small">Ya puedes cerrar esta página.</p>
      </Screen>
    );
  }

  if (stage === "intro") {
    return (
      <Screen className="pt--center pt--intro">
        <Heart />
        <p className="pt-eyebrow">{data.template.name}</p>
        <h1 className="pt-title pt-title--xl">Estamos preparando una sorpresa{name ? ` para ${name}` : ""} 💛</h1>
        <p className="pt-text">
          Solo necesitamos {steps.length === 1 ? "un detalle" : `${steps.length} cosas`} de ti. Te tomará un par de minutos y puedes volver cuando quieras: se guarda solo.
        </p>
        <button type="button" className="pt-btn pt-btn--primary pt-btn--lg" onClick={() => setStage("steps")}>
          Empezar
        </button>
        <p className="pt-small">Tus fotos solo se usan para este regalo.</p>
      </Screen>
    );
  }

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const stepKeys = step.fields.map(([key]) => key);
  const stepIssues = issues.filter((i) => stepKeys.includes(i.path.split(".")[0]));

  const goTo = (index) => {
    setStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    setSubmitting(true);
    clearTimeout(timer.current);
    const saved = await persist();
    if (!saved) {
      setSubmitting(false);
      return;
    }
    const complete = validateContent(template.schema, values, { mode: "publish", keys: data.allowedFields, assets: assetKinds });
    if (!complete.valid) {
      setIssues(complete.errors);
      const first = steps.findIndex((s) => s.fields.some(([key]) => complete.errors.some((e) => e.path.split(".")[0] === key)));
      if (first >= 0) goTo(first);
      setSubmitting(false);
      return;
    }
    try {
      await publicRequest(`/portal/${encodeURIComponent(token)}/submit`, { method: "POST" });
      setStage("done");
      window.scrollTo({ top: 0 });
    } catch (error) {
      if (error.details?.errors) setIssues(error.details.errors);
      else setIssues([{ path: "_", message: error.message }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt pt--steps">
      <header className="pt-top">
        <div className="pt-progress" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={stepIndex + 1} aria-label={`Paso ${stepIndex + 1} de ${steps.length}`}>
          {steps.map((s, i) => (
            <span key={s.id} className={i <= stepIndex ? "is-done" : ""} />
          ))}
        </div>
        <div className="pt-top__row">
          <span className="pt-step-count">
            {stepIndex + 1} de {steps.length}
          </span>
          <span className={`pt-save pt-save--${save}`} aria-live="polite">
            {save === "saving" ? "Guardando…" : save === "saved" ? "Guardado ✓" : save === "error" ? "No se pudo guardar" : ""}
          </span>
        </div>
      </header>

      <main className="pt__inner pt__inner--form">
        <h1 className="pt-title">{step.portalTitle || step.title}</h1>
        {step.portalDescription && <p className="pt-text">{step.portalDescription}</p>}

        {stepIssues.length > 0 && (
          <div className="pt-alert" role="alert">
            {stepIssues.map((i) => (
              <p key={i.path + i.message}>{i.message}</p>
            ))}
          </div>
        )}

        <SchemaForm
          className="pt-form"
          schema={template.schema}
          values={values}
          onChange={(key, value) => {
            setValues((prev) => ({ ...prev, [key]: value }));
            setIssues((prev) => prev.filter((i) => i.path.split(".")[0] !== key));
            schedule();
          }}
          errors={liveErrors}
          stepIds={[step.id]}
          keys={data.allowedFields}
          audience="customer"
          media={media}
          showStepTitles={false}
        />
      </main>

      <footer className="pt-bottom">
        {stepIndex > 0 ? (
          <button type="button" className="pt-btn" onClick={() => goTo(stepIndex - 1)}>
            Atrás
          </button>
        ) : (
          <span />
        )}
        {isLast ? (
          <button type="button" className="pt-btn pt-btn--primary" onClick={submit} disabled={submitting}>
            {submitting ? "Enviando…" : "Enviar contenido"}
          </button>
        ) : (
          <button type="button" className="pt-btn pt-btn--primary" onClick={() => (persist(), goTo(stepIndex + 1))}>
            Siguiente
          </button>
        )}
      </footer>
    </div>
  );
}
