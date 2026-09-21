import Icon from "./Icons.jsx";

/** Propuestas: ícono, título y descripción. */
export default function Proposals({ proposals = [], className = "" }) {
  const items = proposals.filter((p) => p?.title);
  if (!items.length) return null;
  return (
    <ol className={`pk-proposals ${className}`}>
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="pk-proposal">
          <span className="pk-proposal__icon">
            <Icon name={item.icon || "star"} />
          </span>
          <div>
            <h3 className="pk-proposal__title">{item.title}</h3>
            {item.description && <p className="pk-proposal__text">{item.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
