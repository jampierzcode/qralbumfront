import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, DatePicker, Input, Select } from "antd";
import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { adminApi } from "../api.js";
import { useRequest } from "../hooks/useRequest.js";
import { STATUS_FILTERS } from "../lib/gifts.js";
import { listTemplates } from "../../engine/registry.js";
import { EmptyState, PageHeader } from "../components/ui.jsx";
import { GiftGridSkeleton } from "../components/Skeletons.jsx";
import GiftCard, { useGiftActions } from "../components/GiftCard.jsx";

const PAGE_SIZE = 24;

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function GiftsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const q = useDebounced(search);
  const [pages, setPages] = useState(1);

  const filters = {
    status: params.get("status") || "",
    reviewStatus: params.get("reviewStatus") || "",
    collectionId: params.get("collectionId") || "",
    templateId: params.get("templateId") || "",
    customerId: params.get("customerId") || "",
    from: params.get("from") || "",
    to: params.get("to") || "",
  };

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setPages(1);
  };

  useEffect(() => setFilter("q", q), [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), q: q || undefined, pageSize: PAGE_SIZE * pages };
  const key = JSON.stringify(query);
  const { data, loading, error, reload } = useRequest(() => adminApi.gifts(query), [key]);
  const actions = useGiftActions({ onChanged: reload });

  const lookups = useRequest(() => Promise.all([adminApi.collections(), adminApi.customers()]), []);
  const collectionOptions = useMemo(() => (lookups.data?.[0].items || []).map((c) => ({ value: String(c.id), label: c.name })), [lookups.data]);
  const customerOptions = useMemo(() => (lookups.data?.[1].items || []).map((c) => ({ value: String(c.id), label: c.name })), [lookups.data]);
  const templateOptions = useMemo(() => listTemplates().map((t) => ({ value: t.manifest.id, label: t.manifest.name })), []);

  const hasFilters = Object.values(filters).some(Boolean) || q;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = ["collectionId", "templateId", "customerId", "from"].filter((k) => filters[k]).length;
  const items = data?.items || [];

  return (
    <div className="adm-page">
      <PageHeader
        title="Regalos"
        subtitle={data ? `${data.total} ${data.total === 1 ? "regalo" : "regalos"}${filters.status ? "" : " activos"}` : " "}
        actions={
          <Link to="/admin/gifts/new">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              Nuevo regalo
            </Button>
          </Link>
        }
      />

      <div className="adm-chips" role="tablist" aria-label="Estado">
        {/* Atajo para revisar lo que mandaron los referidos. */}
        <button
          type="button"
          role="tab"
          aria-selected={filters.reviewStatus === "pending"}
          className={`adm-chip ${filters.reviewStatus === "pending" ? "is-active" : ""}`}
          onClick={() => setFilter("reviewStatus", filters.reviewStatus === "pending" ? "" : "pending")}
        >
          Por aprobar
        </button>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filters.status === f.value}
            className={`adm-chip ${filters.status === f.value ? "is-active" : ""}`}
            onClick={() => {
              const next = new URLSearchParams(params);
              f.value ? next.set("status", f.value) : next.delete("status");
              next.delete("reviewStatus");
              setParams(next, { replace: true });
              setPages(1);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="adm-toolbar">
        <Input
          className="adm-toolbar__search"
          size="large"
          allowClear
          prefix={<SearchOutlined className="adm-muted" />}
          placeholder="Buscar por destinatario, cliente o link"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button className="adm-toolbar__toggle" size="large" icon={<FilterOutlined />} onClick={() => setFiltersOpen((o) => !o)}>
          Filtros{activeFilterCount ? ` · ${activeFilterCount}` : ""}
        </Button>
        <div className={`adm-toolbar__filters ${filtersOpen ? "is-open" : ""}`}>
        <Select allowClear placeholder="Colección" style={{ minWidth: 150 }} options={collectionOptions} value={filters.collectionId || undefined} onChange={(v) => setFilter("collectionId", v)} />
        <Select allowClear placeholder="Plantilla" style={{ minWidth: 150 }} options={templateOptions} value={filters.templateId || undefined} onChange={(v) => setFilter("templateId", v)} />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Cliente"
          style={{ minWidth: 160 }}
          options={customerOptions}
          value={filters.customerId || undefined}
          onChange={(v) => setFilter("customerId", v)}
        />
        <DatePicker.RangePicker
          allowEmpty={[true, true]}
          placeholder={["Editado desde", "hasta"]}
          value={[filters.from ? dayjs(filters.from) : null, filters.to ? dayjs(filters.to) : null]}
          onChange={(range) => {
            const next = new URLSearchParams(params);
            const [from, to] = range || [];
            from ? next.set("from", from.startOf("day").toISOString()) : next.delete("from");
            to ? next.set("to", to.endOf("day").toISOString()) : next.delete("to");
            setParams(next, { replace: true });
          }}
        />
        </div>
        {hasFilters && (
          <Button type="text" onClick={() => (setSearch(""), setParams({}, { replace: true }))}>
            Limpiar
          </Button>
        )}
      </div>

      {error ? (
        <EmptyState icon="!" title="No pudimos cargar los regalos" text={error} action={<Button onClick={reload}>Reintentar</Button>} />
      ) : loading && !data ? (
        <GiftGridSkeleton />
      ) : items.length === 0 ? (
        hasFilters ? (
          <EmptyState icon="⌕" title="Nada por aquí" text="No hay regalos con esos filtros." action={<Button onClick={() => (setSearch(""), setParams({}, { replace: true }))}>Quitar filtros</Button>} />
        ) : (
          <EmptyState
            title="Aún no hay regalos"
            text="Crea el primero: elige una colección, una plantilla y personalízala."
            action={
              <Link to="/admin/gifts/new">
                <Button type="primary" icon={<PlusOutlined />}>
                  Nuevo regalo
                </Button>
              </Link>
            }
          />
        )
      ) : (
        <>
          <div className="adm-gift-grid" style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
            {items.map((gift) => (
              <GiftCard key={gift.id} gift={gift} actions={actions} />
            ))}
          </div>
          {data.total > items.length && (
            <div style={{ display: "grid", placeItems: "center", marginTop: 28 }}>
              <Button size="large" loading={loading} onClick={() => setPages((p) => p + 1)}>
                Cargar más
              </Button>
            </div>
          )}
        </>
      )}
      {actions.dialogs}
    </div>
  );
}
