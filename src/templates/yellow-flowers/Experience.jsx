import "./styles.css";

// Versión inicial para validar el motor (Fase 3). La experiencia completa llega en la Fase 9.
export default function YellowFlowersExperience({ content }) {
  return (
    <main className="yf">
      <header className="yf__header">
        {content.recipientName && <p className="yf__eyebrow">Para {content.recipientName}</p>}
        <h1 className="yf__title">{content.title}</h1>
      </header>
      {content.message && <p className="yf__message">{content.message}</p>}
      <section className="yf__photos" aria-label="Recuerdos">
        {content.photos.map((photo) => (
          <img
            key={photo.id}
            className="yf__photo"
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="(min-width: 768px) 30vw, 80vw"
            width={photo.width || undefined}
            height={photo.height || undefined}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ))}
      </section>
      {content.senderName && <p className="yf__signature">Con cariño, {content.senderName}</p>}
    </main>
  );
}
