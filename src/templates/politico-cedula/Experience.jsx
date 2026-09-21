import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/caveat/700.css";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import CampaignCard from "../_politician-kit/CampaignCard.jsx";
import Icon from "../_politician-kit/Icons.jsx";
import Links from "../_politician-kit/Links.jsx";
import PartyMark from "../_politician-kit/PartyMark.jsx";
import Proposals from "../_politician-kit/Proposals.jsx";
import Team from "../_politician-kit/Team.jsx";
import { calendarLink, campaignList, contrastColor, dateParts, daysUntil, eventDateTime, formatTime, initial, readableOnLight } from "../_politician-kit/format.js";
import "../_politician-kit/politician-kit.css";
import "./styles.css";

function Section({ title, children }) {
  return (
    <section className="pd-section" aria-label={title}>
      <Reveal as="h2" className="pd-h">
        {title}
      </Reveal>
      <Reveal delay={80}>{children}</Reveal>
    </section>
  );
}

/** Recuadro del símbolo: el logo del partido y un aspa (X) que se dibuja sola encima cuando `marked` es true. */
function MarkBox({ logo, partyName, marked, className = "" }) {
  return (
    <span className={`pd-box ${marked ? "is-marked" : ""} ${className}`} role="img" aria-label={`Recuadro del símbolo${partyName ? ` de ${partyName}` : ""}, marcado`}>
      {logo?.src ? (
        <img className="pd-box__logo" src={logo.src} srcSet={logo.srcSet} sizes="220px" alt="" draggable={false} loading="eager" decoding="async" />
      ) : (
        <span className="pd-box__initial">{initial(partyName) || "★"}</span>
      )}
      <svg className="pd-box__x" viewBox="0 0 100 100" aria-hidden="true">
        <path pathLength="1" d="M17 15C36 36 62 62 84 86" />
        <path pathLength="1" d="M85 13C64 36 38 62 15 88" />
      </svg>
    </span>
  );
}

/**
 * Político · Cédula. Abre directo (sin "toca para abrir"). La portada es una cédula de votación de
 * referencia: el nombre de la organización y el recuadro de su símbolo (el logo), donde una X se dibuja
 * sola. La foto del candidato sólo aparece si se activa (`ballotShowPhoto`): las cédulas de las
 * elecciones regionales y municipales 2026 no la llevan.
 */
export default function PoliticoCedulaExperience({ content, mode, onEvent, env, opened, open }) {
  const {
    recipientName, photo, office, place, slogan, bio,
    partyName, partyLogo, ballotShowPhoto, colorPrimary, colorAccent,
    voteDate, voteTime, team = [], proposals = [], links = [],
  } = content;

  const calm = env.reducedMotion || mode === "thumbnail" || env.tier === "low";
  const days = daysUntil(voteDate);
  const date = dateParts(voteDate);
  const { upcoming, past } = useMemo(() => campaignList(content), [content]);
  const hasLinks = links.some((l) => l?.url);

  // La X se dibuja un momento después de entrar; con "calma" ya viene marcada.
  const [marked, setMarked] = useState(calm);
  useEffect(() => {
    if (calm) {
      setMarked(true);
      return undefined;
    }
    const id = setTimeout(() => setMarked(true), 1100);
    return () => clearTimeout(id);
  }, [calm]);

  const endRef = useRef(null);
  const endVisible = useInView(endRef, { threshold: 0.4 });

  // Sin música ni "toca para abrir": se abre sola para que cuente la visita.
  useEffect(() => {
    if (!opened) open?.();
  }, [opened, open]);

  useEffect(() => {
    if (endVisible) onEvent?.("completed");
  }, [endVisible, onEvent]);

  const style = {
    "--pd-primary": colorPrimary,
    "--pd-accent": colorAccent,
    "--pd-on-primary": contrastColor(colorPrimary),
    "--pd-on-accent": contrastColor(colorAccent),
    // Variante del color principal que se lee sobre papel claro (un partido amarillo no debe dar una X amarilla).
    "--pd-strong": readableOnLight(colorPrimary),
  };

  const agenda = calendarLink({
    title: `Votación: ${[office, recipientName].filter(Boolean).join(" ")}${partyName ? ` · ${partyName}` : ""}`,
    start: eventDateTime(voteDate, voteTime || "07:00"),
    hours: 10,
    location: place,
    details: slogan,
  });
  const upcomingVote = days !== null && days >= 0;
  const showPhoto = Boolean(ballotShowPhoto && photo?.src);

  return (
    <div className="pd" style={style} data-calm={calm ? "true" : undefined} data-marked={marked ? "true" : undefined} data-gift-static>
      {/* 1 · Portada: la cédula */}
      <header className="pd-hero" aria-label="Portada">
        <div className="pd-hero__inner">
          <div className="pd-copy">
            <p className="pd-eyebrow">Vota por</p>
            <h1 className="pd-name">{recipientName}</h1>
            <p className="pd-office">
              {office && <span className="pd-office__role">{office}</span>}
              {place && (
                <span className="pd-office__place">
                  <Icon name="pin" />
                  {place}
                </span>
              )}
            </p>
            {slogan && <p className="pd-slogan">{slogan}</p>}
          </div>

          <div className="pd-ballotwrap">
            <figure className="pd-ballot">
              <div className="pd-ballot__band">
                <span>Cédula de votación</span>
                {office && <span>{office}</span>}
              </div>
              <p className="pd-ballot__rule">Marca con una cruz (+) o un aspa (X) dentro del recuadro del símbolo{showPhoto ? " y/o la fotografía" : ""} de tu preferencia</p>
              <div className="pd-ballot__body">
                <p className="pd-ballot__party">{partyName || "Organización política"}</p>
                <div className="pd-ballot__boxes" data-count={showPhoto ? 2 : 1}>
                  <MarkBox logo={partyLogo} partyName={partyName} marked={marked} />
                  {showPhoto && (
                    <span className="pd-box pd-box--photo">
                      <img
                        src={photo.src}
                        srcSet={photo.srcSet}
                        sizes="(min-width: 760px) 18vw, 34vw"
                        width={photo.width || undefined}
                        height={photo.height || undefined}
                        alt={recipientName}
                        fetchPriority="high"
                        decoding="async"
                        draggable={false}
                      />
                    </span>
                  )}
                </div>
              </div>
              <figcaption className="pd-ballot__foot">Imagen referencial</figcaption>
            </figure>
            <p className="pd-note" aria-hidden="true">
              ¡Marca así!
              <svg viewBox="0 0 60 44" className="pd-note__arrow">
                <path d="M4 40C10 22 26 10 50 8M50 8 39 3M50 8 42 18" />
              </svg>
            </p>
          </div>

          {(voteDate || partyLogo?.src || partyName) && (
            <div className="pd-ticket" role="group" aria-label="Día de la votación">
              {date && (
                <div className="pd-ticket__date" aria-hidden="true">
                  <span className="pd-ticket__month">{date.monthShort}</span>
                  <span className="pd-ticket__day">{date.day}</span>
                  <span className="pd-ticket__week">{date.weekday}</span>
                </div>
              )}
              <div className="pd-ticket__info">
                <span className="pd-tag">{upcomingVote ? "Día de la votación" : date ? "Votación" : "Recuerda"}</span>
                {upcomingVote ? (
                  <p className="pd-ticket__count">
                    {days === 0 ? (
                      <b>¡Hoy se vota!</b>
                    ) : days === 1 ? (
                      <b>¡Mañana se vota!</b>
                    ) : (
                      <>
                        Faltan <b>{days}</b> días
                      </>
                    )}
                  </p>
                ) : days !== null ? (
                  <p className="pd-ticket__count">
                    <b>Gracias por tu apoyo</b>
                  </p>
                ) : (
                  <p className="pd-ticket__count">
                    Marca el <b>símbolo</b>
                  </p>
                )}
                {date && (
                  <p className="pd-ticket__time">
                    <Icon name="clock" />
                    {voteTime ? formatTime(voteTime) : "Día de votación"}
                  </p>
                )}
                {agenda && upcomingVote && (
                  <a className="pd-ticket__cal" href={agenda} target="_blank" rel="noopener noreferrer">
                    <Icon name="calendar" />
                    Agendar
                  </a>
                )}
              </div>
              <div className="pd-ticket__stub">
                <PartyMark logo={partyLogo} partyName={partyName} showName={false} />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="pd-main">
        {bio && (
          <Section title="Quién es">
            <p className="pd-bio">{bio}</p>
          </Section>
        )}

        {hasLinks && (
          <Section title="Súmate a la campaña">
            <Links links={links} />
          </Section>
        )}

        {proposals.some((p) => p?.title) && (
          <Section title="Propuestas">
            <Proposals proposals={proposals} />
          </Section>
        )}

        {(upcoming.length > 0 || past.length > 0) && (
          <Section title="Campañas">
            {upcoming.length > 0 && (
              <>
                <h3 className="pd-sub">Próximas · te esperamos</h3>
                <div className="pd-campaigns">
                  {upcoming.map((c, i) => (
                    <CampaignCard key={`u-${i}`} campaign={c} />
                  ))}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <h3 className="pd-sub">Ya realizadas</h3>
                <div className="pd-campaigns pd-campaigns--past">
                  {past.map((c, i) => (
                    <CampaignCard key={`p-${i}`} campaign={c} />
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        {team.some((m) => m?.name) && (
          <Section title="Equipo de trabajo">
            <Team team={team} />
          </Section>
        )}
      </main>

      {/* 3 · Cierre: la X vuelve a marcarse al llegar */}
      <footer className="pd-footer" ref={endRef}>
        <div className="pd-footer__inner">
          <p className="pd-footer__eyebrow">Ese día, marca así</p>
          <MarkBox logo={partyLogo} partyName={partyName} marked={calm || endVisible} className="pd-box--footer" />
          {partyName && <p className="pd-footer__party">{partyName}</p>}
          <p className="pd-footer__name">{recipientName}</p>
          <p className="pd-footer__office">{[office, place].filter(Boolean).join(" · ")}</p>
          {slogan && <p className="pd-footer__slogan">{slogan}</p>}
          <p className="pd-footer__legal">Tarjeta digital de presentación · Imagen referencial</p>
        </div>
      </footer>
    </div>
  );
}
