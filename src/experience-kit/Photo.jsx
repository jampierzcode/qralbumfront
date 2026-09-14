import { useState } from "react";
import "./photo.css";

/**
 * Imagen preparada por gift-core ({ src, srcSet, width, height, placeholder }).
 * Nunca carga el original: usa variantes con srcSet/sizes y un placeholder difuminado.
 */
export default function Photo({ image, sizes = "100vw", alt = "", className = "", loading = "lazy", fit = "cover", style, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  if (!image?.src) return null;
  const ratio = image.width && image.height ? `${image.width} / ${image.height}` : undefined;

  return (
    <span className={`xk-photo ${loaded ? "is-loaded" : ""} ${className}`} style={{ aspectRatio: ratio, ...style }}>
      {image.placeholder && <span className="xk-photo__placeholder" style={{ backgroundImage: `url("${image.placeholder}")` }} aria-hidden="true" />}
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={image.srcSet ? sizes : undefined}
        width={image.width || undefined}
        height={image.height || undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        style={{ objectFit: fit }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        {...rest}
      />
    </span>
  );
}
