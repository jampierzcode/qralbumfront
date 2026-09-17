import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { App, Button, Input, Select } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { getSteps, BOUND_KEYS } from "../../../gift-core/index.js";
import { getTemplate } from "../../engine/registry.js";
import { adminApi, errorMessage } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { money, occasionLabel } from "../lib/gifts.js";
import { CollectionCover, EmptyState, PageHeader } from "../components/ui.jsx";
import { Skel } from "../components/Skeletons.jsx";
import { CustomerPicker } from "../components/customers.jsx";
import { TemplateChoiceCard, TemplateDemoModal } from "../components/TemplateCards.jsx";

const ORDER = ["collection", "template", "details"];

/** Número de pasos que generará el schema (sin los nombres, que se piden aquí). */
export function schemaStepCount(templateId) {
  const template = getTemplate(templateId);
  if (!template) return 0;
  return getSteps(template.schema).filter((s) => s.fields.some(([key]) => !BOUND_KEYS.includes(key))).length;
}

export function WizardProgress({ current, total, label }) {
  return (
    <div className="adm-steps" aria-label={`Paso ${current} de ${total}`}>
      <div className="adm-steps__dots" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`adm-steps__dot ${i < current ? "is-done" : ""}`} />
        ))}
      </div>
      <span>
        Paso {current} de {total}
        {label ? ` · ${label}` : ""}
      </span>
    </div>
  );
}

export default function GiftWizardPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [params, setParams] = useSearchParams();
  const step = ORDER.includes(params.get("step")) ? params.get("step") : "collection";
  const collectionId = params.get("collectionId");
  const templateId = params.get("templateId");

  const [demo, setDemo] = useState(null);
  const [details, setDetails] = useState({
    senderName: "",
    recipientName: "",
    customerId: params.get("customerId") ? Number(params.get("customerId")) : null,
    occasion: null,
  });
  const [creating, setCreating] = useState(false);

  const catalog = useRequest(() => Promise.all([adminApi.collections(), adminApi.templates()]), []);
  const collections = (catalog.data?.[0].items || []).filter((c) => c.isActive);
  const listings = catalog.data?.[1].items || [];
  const listingById = useMemo(() => Object.fromEntries(listings.map((l) => [l.templateId, l])), [listings]);
  const activeTemplates = listings.filter((l) => l.isActive && l.available);

  const go = (nextStep, extra = {}) => {
    const next = new URLSearchParams(params);
    next.set("step", nextStep);
    Object.entries(extra).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
    window.scrollTo({ top: 0 });
  };

  const collection = collections.find((c) => String(c.id) === collectionId);
  // Precio más bajo de cada colección, para orientar antes de entrar.
  const priceFrom = (c) => {
    const prices = c.templateIds.map((id) => listingById[id]?.referralPrice).filter((p) => p !== null && p !== undefined);
    return prices.length ? Math.min(...prices) : null;
  };
  const templatesInStep = collection
    ? collection.templateIds.map((id) => listingById[id]).filter((l) => l?.isActive && l.available)
    : activeTemplates;

  const template = templateId ? getTemplate(templateId) : null;
  // Antes de elegir plantilla se estima con la plantilla de más pasos.
  const totalSteps = 3 + (templateId ? schemaStepCount(templateId) : Math.max(0, ...activeTemplates.map((l) => schemaStepCount(l.templateId)))) + 1;
  const current = ORDER.indexOf(step) + 1;

  const create = async () => {
    setCreating(true);
    try {
      const gift = await adminApi.createGift({ templateId, ...details });
      navigate(`/admin/gifts/${gift.id}/setup`, { replace: true });
    } catch (err) {
      message.error(errorMessage(err));
      setCreating(false);
    }
  };

  return (
    <div className="adm-page">
      <PageHeader
        back={step === "collection" ? { to: "/admin/gifts", label: "Regalos" } : undefined}
        title={
          step === "collection" ? "¿Qué quieres regalar?" : step === "template" ? "Elige la experiencia" : "¿Para quién es?"
        }
        subtitle={
          step === "collection"
            ? "Empieza por la ocasión."
            : step === "template"
              ? collection
                ? `${collection.name} · ${templatesInStep.length} ${templatesInStep.length === 1 ? "plantilla" : "plantillas"}`
                : "Todas las plantillas"
              : template?.manifest.name
        }
      />
      <WizardProgress current={current} total={totalSteps} />

      {catalog.error && <EmptyState icon="!" title="No pudimos cargar el catálogo" text={catalog.error} action={<Button onClick={catalog.reload}>Reintentar</Button>} />}

      {step === "collection" && !catalog.error && (
        <>
          <div className="adm-choice-grid">
            {catalog.loading
              ? Array.from({ length: 6 }, (_, i) => <Skel key={i} h="auto" r={16} style={{ aspectRatio: "4 / 3" }} />)
              : collections.map((c) => (
                  <button key={c.id} type="button" className="adm-choice" onClick={() => go("template", { collectionId: String(c.id), templateId: null })}>
                    <div className="adm-choice__media">
                      <CollectionCover collection={c} />
                      <span className="adm-choice__count">{c.templateIds.filter((id) => listingById[id]?.isActive).length}</span>
                    </div>
                    <div>
                      <h3 className="adm-choice__title">
                        {c.name}
                        {priceFrom(c) !== null && <span className="adm-choice__price">desde {money(priceFrom(c))}</span>}
                      </h3>
                      {c.description && <p className="adm-choice__text">{c.description}</p>}
                    </div>
                  </button>
                ))}
          </div>
          {!catalog.loading && (
            <div className="adm-footer-bar">
              <span className="adm-muted">¿Ya sabes qué plantilla quieres?</span>
              <Button onClick={() => go("template", { collectionId: null })}>Ver todas las plantillas</Button>
            </div>
          )}
        </>
      )}

      {step === "template" && !catalog.error && (
        <>
          {templatesInStep.length === 0 && !catalog.loading ? (
            <EmptyState title="Esta colección aún no tiene plantillas" text="Asígnale plantillas desde Colecciones o elige otra ocasión." action={<Button onClick={() => go("collection")}>Elegir otra colección</Button>} />
          ) : (
            <div className="adm-choice-grid adm-choice-grid--wide">
              {templatesInStep.map((l) => (
                <TemplateChoiceCard
                  key={l.templateId}
                  templateId={l.templateId}
                  name={l.name}
                  description={l.description}
                  price={l.referralPrice}
                  selected={templateId === l.templateId}
                  onChoose={() => go("details", { templateId: l.templateId })}
                  onDemo={() => setDemo(l.templateId)}
                />
              ))}
            </div>
          )}
          <div className="adm-footer-bar">
            <Button icon={<ArrowLeftOutlined />} onClick={() => go("collection")}>
              Colecciones
            </Button>
          </div>
        </>
      )}

      {step === "details" && (
        <div className="adm-form-narrow">
          {!template ? (
            <EmptyState title="Primero elige una plantilla" action={<Button onClick={() => go("template")}>Elegir plantilla</Button>} />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                create();
              }}
            >
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="wz-recipient">
                  Quién lo recibe
                </label>
                <Input id="wz-recipient" size="large" autoFocus placeholder="Andrea" maxLength={40} value={details.recipientName} onChange={(e) => setDetails((d) => ({ ...d, recipientName: e.target.value }))} />
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="wz-sender">
                  Quién lo envía
                </label>
                <Input id="wz-sender" size="large" placeholder="Diego" maxLength={40} value={details.senderName} onChange={(e) => setDetails((d) => ({ ...d, senderName: e.target.value }))} />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Cliente</span>
                <CustomerPicker value={details.customerId} onChange={(customerId) => setDetails((d) => ({ ...d, customerId }))} />
                <p className="adm-field__hint">Quien te compró el regalo. Puedes dejarlo vacío.</p>
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="wz-occasion">
                  Ocasión
                </label>
                <Select
                  id="wz-occasion"
                  size="large"
                  allowClear
                  placeholder="Elige la ocasión"
                  value={details.occasion ?? undefined}
                  onChange={(occasion) => setDetails((d) => ({ ...d, occasion: occasion ?? null }))}
                  options={template.manifest.occasions.map((o) => ({ value: o, label: occasionLabel(o) }))}
                />
              </div>
              <div className="adm-footer-bar adm-footer-bar--sticky">
                <Button icon={<ArrowLeftOutlined />} onClick={() => go("template")}>
                  Plantillas
                </Button>
                <Button type="primary" size="large" htmlType="submit" loading={creating} icon={<ArrowRightOutlined />} iconPosition="end">
                  Crear y personalizar
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      <TemplateDemoModal
        templateId={demo}
        open={Boolean(demo)}
        onClose={() => setDemo(null)}
        onChoose={() => {
          const id = demo;
          setDemo(null);
          go("details", { templateId: id });
        }}
      />
    </div>
  );
}
