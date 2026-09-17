// "Comparte tus fotos": código QR al álbum donde los invitados suben sus fotos.
import { QRCodeSVG } from "qrcode.react";
import Icon from "./Icons.jsx";

export default function PhotoShare({
  url,
  hashtag = "",
  title = "Comparte tus fotos",
  text = "Escanea el código y sube las fotos que tomes en nuestra boda.",
  bg = "#ffffff",
  fg = "#1f2420",
  className = "",
}) {
  if (!url) return null;
  return (
    <div className={`wk-share ${className}`}>
      <Icon name="camera" className="wk-share__icon" />
      <p className="wk-share__title">{title}</p>
      <p className="wk-share__text">{text}</p>
      <span className="wk-share__qr">
        <QRCodeSVG value={url} size={148} bgColor={bg} fgColor={fg} level="M" marginSize={2} />
      </span>
      {hashtag && <p className="wk-share__hashtag">{hashtag}</p>}
      <a className="wk-link" href={url} target="_blank" rel="noreferrer">
        Abrir el álbum
      </a>
    </div>
  );
}
