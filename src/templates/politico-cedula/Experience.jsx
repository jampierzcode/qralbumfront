import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource/caveat/700.css";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import CampaignCard from "../_politician-kit/CampaignCard.jsx";
import Icon from "../_politician-kit/Icons.jsx";
import Links from "../_politician-kit/Links.jsx";
import PartyMark, { PartyLogo } from "../_politician-kit/PartyMark.jsx";
import Proposals from "../_politician-kit/Proposals.jsx";
import Team from "../_politician-kit/Team.jsx";
import { calendarLink, campaignList, contrastColor, dateParts, daysUntil, eventDateTime, formatTime, readableOnLight } from "../_politician-kit/format.js";
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

/** Recuadro de la cédula: el número de fondo y la X que se dibuja sola cuando `marked` es true. */
function BallotBox({ number, marked, className = "" }) {
  return (
    <span className={`pd-box ${marked ? "is-marked" : ""} ${className}`} role="img" aria-label={number ? `Casilla del número ${number}, marcada` : "Casilla marcada"}>
      {number && <span className="pd-box__number">{number}</span>}
      <svg className="pd-box__x" viewBox="0 0 100 100" aria-hidden="true">
        <path pathLength="1" d="M17 15C36 36 62 62 84 86" />
        <path pathLength="1" d="M85 13C64 36 38 62 15 88" />
      </svg>
    </span>
  );
}

/**
 * Político · Cédula. Abre directo (sin "toca para abrir"). La portada es una cédula de votación de
 * referencia —foto, logo del partido y la casilla con el número— y la X se dibuja sola al entrar.
 */
export default function PoliticoCedulaExperience({ content, mode, onEvent, env, opened, open }) {
  const {
    recipientName, photo, office, place, slogan, bio,
    partyName, partyLogo, ballotNumber, colorPrimary, colorAccent,
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
    "--pd-num-scale": ballotNumber && ballotNumber.length > 3 ? 0.62 : ballotNumber && ballotNumber.length === 3 ? 0.82 : 1,
  };

  const agenda = calendarLink({
    title: `Votación: ${[office, recipientName].filter(Boolean).join(" ")}${ballotNumber ? ` · N° ${ballotNumber}` : ""}`,
    start: eventDateTime(voteDate, voteTime || "07:00"),
    hours: 10,
    location: place,
    details: slogan,
  });
  const upcomingVote = days !== null && days >= 0;

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
              <div className="pd-ballot__row">
                <div className="pd-cell pd-cell--party">
                  <PartyLogo logo={partyLogo} partyName={partyName} className="pd-ballot__logo" />
                  {partyName && <span className="pd-cell__party">{partyName}</span>}
                </div>
                <div className="pd-cell pd-cell--photo">
                  {photo?.src ? (
                    <img
                      src={photo.src}
                      srcSet={photo.srcSet}
                      sizes="(min-width: 760px) 20vw, 40vw"
                      width={photo.width || undefined}
                      height={photo.height || undefined}
                      alt={recipientName}
                      fetchPriority="high"
                      decoding="async"
                      draggable={false}
                    />
                  ) : (
                    <Icon name="user" className="pd-cell__nophoto" />
                  )}
                </div>
                <div className="pd-cell pd-cell--mark">
                  <small>Marca aquí</small>
                  <BallotBox number={ballotNumber} marked={marked} />
                  {ballotNumber && <span className="pd-cell__chip">N° {ballotNumber}</span>}
                </div>
              </div>
              <figcaption className="pd-ballot__foot">Imagen referencial · marca una cruz o un aspa dentro del recuadro</figcaption>
            </figure>
            <p className="pd-note" aria-hidden="true">
              ¡Marca así!
              <svg viewBox="0 0 60 44" className="pd-note__arrow">
                <path d="M4 40C10 22 26 10 50 8M50 8 39 3M50 8 42 18" />
              </svg>
            </p>
          </div>

          {(voteDate || ballotNumber || partyLogo?.src) && (
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
                  ballotNumber && (
                    <p className="pd-ticket__count">
                      Marca el <b>N° {ballotNumber}</b>
                    </p>
                  )
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
                <PartyMark logo={partyLogo} partyName={partyName} number={ballotNumber} />
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
          <BallotBox number={ballotNumber} marked={calm || endVisible} className="pd-box--footer" />
          <div className="pd-footer__party">
            <PartyLogo logo={partyLogo} partyName={partyName} />
            {partyName && <span>{partyName}</span>}
          </div>
          <p className="pd-footer__name">{recipientName}</p>
          <p className="pd-footer__office">{[office, place].filter(Boolean).join(" · ")}</p>
          {slogan && <p className="pd-footer__slogan">{slogan}</p>}
          <p className="pd-footer__legal">Tarjeta digital de presentación · Imagen referencial</p>
        </div>
      </footer>
    </div>
  );
}
