export function Skel({ w = "100%", h = 14, r, style }) {
  return <div className="adm-skel" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="adm-page" aria-busy="true" aria-label="Cargando">
      <Skel w={120} h={12} style={{ marginBottom: 12 }} />
      <Skel w={260} h={28} style={{ marginBottom: 32 }} />
      <GiftGridSkeleton />
    </div>
  );
}

export function GiftGridSkeleton({ count = 8 }) {
  return (
    <div className="adm-gift-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="adm-gift-card">
          <Skel h="auto" r={12} style={{ aspectRatio: "4 / 3" }} />
          <Skel w="70%" />
          <Skel w="45%" h={12} />
        </div>
      ))}
    </div>
  );
}

export function RowsSkeleton({ count = 5 }) {
  return (
    <div className="adm-rows" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="adm-row">
          <Skel w={40} h={40} r={20} />
          <div className="adm-row__main">
            <Skel w="40%" />
            <Skel w="25%" h={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
