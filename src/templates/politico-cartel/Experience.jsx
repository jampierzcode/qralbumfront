import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource-variable/nunito/index.css";
import "@fontsource-variable/inter/index.css";
import Reveal, { useInView } from "../../experience-kit/Reveal.jsx";
import CampaignCard from "../_politician-kit/CampaignCard.jsx";
import Icon from "../_politician-kit/Icons.jsx";
import Links from "../_politician-kit/Links.jsx";
import PartyMark, { PartyLogo } from "../_politician-kit/PartyMark.jsx";
import Proposals from "../_politician-kit/Proposals.jsx";
import Team from "../_politician-kit/Team.jsx";
import { useCutout } from "../_politician-kit/useCutout.js";
import { calendarLink, campaignList, contrastColor, daysUntil, eventDateTime, formatTime, formatVoteDate, mixHex, readableOnLight, visibleOn } from "../_politician-kit/format.js";
import "../_politician-kit/politician-kit.css";
import "./styles.css";

const pad = (n) => String(n).padStart(2, "0");

function Section({ id, title, children, className = "" }) {
  return (
    <section id={id} className={`pc-section ${className}`} aria-label={title}>
      <Reveal as="h2" className="pc-h">
        {title}
      </Reveal>
      <Reveal delay={80}>{children}</Reveal>
    </section>
  );
}

/**
 * Político · Cartel. Abre directo (sin "toca para abrir"): una tarjeta de presentación se lee al instante.
 * La foto puede ser un recorte con fondo transparente (se ve como cartel) o una foto normal (se enmarca).
 */
export default function PoliticoCartelExperience({ content, mode, onEvent, env, opened, open }) {
  const {
    recipientName, photo, office, place, slogan, bio,
    partyName, partyLogo, ballotNumber, colorPrimary, colorAccent,
    voteDate, voteTime, team = [], proposals = [], links = [],
  } = content;

  const calm = env.reducedMotion || mode === "thumbnail" || env.tier === "low";
  const days = daysUntil(voteDate);
  const { upcoming, past } = useMemo(() => campaignList(content), [content]);
  const photoKind = useCutout(photo?.src);
  const hasLinks = links.some((l) => l?.url);

  const heroRef = useRef(null);
  const endRef = useRef(null);
  const [pastHero, setPastHero] = useState(false);
  const endVisible = useInView(endRef, { threshold: 0.4 });

  // Sin música ni "toca para abrir": se abre sola para que cuente la visita.
  useEffect(() => {
    if (!opened) open?.();
  }, [opened, open]);

  useEffect(() => {
    if (endVisible) onEvent?.("completed");
  }, [endVisible, onEvent]);

  // La barra "Vota N°" aparece cuando la portada ya quedó arriba.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined" || mode === "thumbnail") return;
    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mode]);

  const style = {
    "--pc-primary": colorPrimary,
    "--pc-accent": colorAccent,
    "--pc-on-primary": contrastColor(colorPrimary),
    "--pc-on-accent": contrastColor(colorAccent),
    // Variantes legibles para cualquier color de partido: texto sobre blanco y acento sobre el pie oscuro.
    "--pc-strong": readableOnLight(colorPrimary),
    "--pc-accent-lit": visibleOn(colorAccent, mixHex(colorPrimary, "#000000", 0.5)),
    "--pc-num-scale": ballotNumber && ballotNumber.length > 3 ? 0.6 : ballotNumber && ballotNumber.length === 3 ? 0.78 : 1,
  };

  const voteAt = eventDateTime(voteDate, voteTime || "07:00");
  const agenda = calendarLink({
    title: `Votación: ${[office, recipientName].filter(Boolean).join(" ")}${ballotNumber ? ` · N° ${ballotNumber}` : ""}`,
    start: voteAt,
    hours: 10,
    location: place,
    details: slogan,
  });
  const firstName = (recipientName || "").split(" ")[0];
  const goToLinks = () => document.getElementById("pc-links")?.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });

  return (
    <div className="pc" style={style} data-calm={calm ? "true" : undefined} data-gift-static>
      {/* 1 · Portada */}
      <header className="pc-hero" ref={heroRef} data-photo={photoKind} aria-label="Portada">
        <div className="pc-hero__bg" aria-hidden="true" />
        <div className="pc-hero__inner">
          <div className="pc-hero__copy">
            {(partyLogo?.src || partyName) && (
              <div className="pc-party">
                <PartyLogo logo={partyLogo} partyName={partyName} />
                {partyName && <span className="pc-party__name">{partyName}</span>}
              </div>
            )}
            <p className="pc-eyebrow">Vota por</p>
            <h1 className="pc-name">{recipientName}</h1>
            <p className="pc-office">
              {office && <span className="pc-office__role">{office}</span>}
              {place && (
                <span className="pc-office__place">
                  <Icon name="pin" />
                  {place}
                </span>
              )}
            </p>
            {slogan && <p className="pc-slogan">{slogan}</p>}
          </div>

          <div className="pc-stage">
            {ballotNumber && (
              <span className="pc-number" aria-label={`Número ${ballotNumber}`}>
                {ballotNumber}
              </span>
            )}
            {photo?.src && (
              <div className="pc-figure">
                <img
                  className="pc-photo"
                  src={photo.src}
                  srcSet={photo.srcSet}
                  sizes="(min-width: 760px) 46vw, 92vw"
                  width={photo.width || undefined}
                  height={photo.height || undefined}
                  alt={recipientName}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2 · Día de la votación, con el logo y el número del partido */}
      {(voteDate || ballotNumber || partyLogo?.src) && (
        <div className="pc-vote" role="group" aria-label="Día de la votación">
          <PartyMark logo={partyLogo} partyName={partyName} number={ballotNumber} />
          <div className="pc-vote__when">
            {days !== null && days >= 0 ? (
              <>
                <span className="pc-pill">{days === 0 ? "¡Hoy se vota!" : days === 1 ? "¡Mañana se vota!" : "Faltan"}</span>
                {days > 1 && (
                  <p className="pc-days">
                    <b>{pad(days)}</b> días
                  </p>
                )}
              </>
            ) : days !== null ? (
              <span className="pc-pill">Gracias por tu apoyo</span>
            ) : (
              <>
                <span className="pc-pill">Recuerda</span>
                {ballotNumber && (
                  <p className="pc-days">
                    Marca <b>N° {ballotNumber}</b>
                  </p>
                )}
              </>
            )}
            {voteDate && (
              <p className="pc-vote__date">
                <Icon name="calendar" />
                {formatVoteDate(voteDate)}
                {voteTime && ` · ${formatTime(voteTime)}`}
              </p>
            )}
          </div>
          {agenda && days !== null && days >= 0 && (
            <a className="pc-vote__cal" href={agenda} target="_blank" rel="noopener noreferrer" aria-label="Agendar el día de la votación">
              <Icon name="calendar" />
            </a>
          )}
        </div>
      )}

      <main className="pc-main">
        {bio && (
          <Section title="Quién es">
            <p className="pc-bio">{bio}</p>
          </Section>
        )}

        {hasLinks && (
          <Section id="pc-links" title="Súmate a la campaña">
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
                <h3 className="pc-sub">Próximas · te esperamos</h3>
                <div className="pc-campaigns">
                  {upcoming.map((c, i) => (
                    <CampaignCard key={`u-${i}`} campaign={c} />
                  ))}
                </div>
              </>
            )}
            {past.length > 0 && (
              <>
                <h3 className="pc-sub">Ya realizadas</h3>
                <div className="pc-campaigns pc-campaigns--past">
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

      {/* 3 · Cierre */}
      <footer className="pc-footer" ref={endRef}>
        <div className="pc-footer__inner">
          {(partyLogo?.src || partyName) && (
            <div className="pc-party pc-party--center">
              <PartyLogo logo={partyLogo} partyName={partyName} />
              {partyName && <span className="pc-party__name">{partyName}</span>}
            </div>
          )}
          <p className="pc-eyebrow">Vota por</p>
          <p className="pc-footer__name">{recipientName}</p>
          {ballotNumber && <p className="pc-footer__number">{ballotNumber}</p>}
          <p className="pc-footer__office">{[office, place].filter(Boolean).join(" · ")}</p>
          {slogan && <p className="pc-footer__slogan">{slogan}</p>}
        </div>
      </footer>

      {/* Barra fija: no se pierde el número mientras se lee */}
      {mode !== "thumbnail" && ballotNumber && (
        <div className="pc-bar" data-show={pastHero ? "true" : undefined} aria-hidden={!pastHero}>
          <PartyLogo logo={partyLogo} partyName={partyName} className="pc-bar__logo" />
          <span className="pc-bar__text">
            <small>Vota por</small>
            <strong>{firstName}</strong>
          </span>
          <span className="pc-bar__num">N° {ballotNumber}</span>
          {hasLinks && (
            <button type="button" className="pc-bar__go" onClick={goToLinks} tabIndex={pastHero ? 0 : -1}>
              Súmate
              <Icon name="arrow" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
