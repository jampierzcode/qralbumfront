import "./shell.css";

export function ShellLoading({ label = "Preparando tu regalo…" }) {
  return (
    <div className="gs-status" role="status" aria-live="polite">
      <div className="gs-status__spinner" aria-hidden="true" />
      <p className="gs-status__text">{label}</p>
    </div>
  );
}

export function ShellMessage({ title, text, action }) {
  return (
    <div className="gs-status" role="alert">
      <p className="gs-status__icon" aria-hidden="true">✦</p>
      <h1 className="gs-status__title">{title}</h1>
      {text && <p className="gs-status__text">{text}</p>}
      {action && (
        <button type="button" className="gs-gate__button gs-status__button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
