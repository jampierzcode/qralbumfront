import Icon from "./Icons.jsx";
import { iconOfNetwork, linkHref, linkLabel } from "./networks.js";

/** Botones de redes y links personalizados: ícono de la red + etiqueta que puso el cliente. */
export default function Links({ links = [], className = "" }) {
  const items = links.map((item) => ({ ...item, href: linkHref(item) })).filter((item) => item.href);
  if (!items.length) return null;
  return (
    <ul className={`pk-links ${className}`}>
      {items.map((item, i) => {
        const external = item.href.startsWith("https:");
        return (
          <li key={`${item.network}-${i}`}>
            <a className={`pk-link pk-link--${item.network}`} href={item.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className="pk-link__icon">
                <Icon name={iconOfNetwork(item.network)} />
              </span>
              <span className="pk-link__label">{linkLabel(item)}</span>
              <Icon name="arrow" className="pk-link__go" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
