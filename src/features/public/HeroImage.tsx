import { useState } from 'react';

/**
 * Put your photo at  public/images/hero.jpg  (see public/images/README.md).
 * Until that file exists the bundled illustration is shown, and a shimmer is displayed while loading.
 */
export const HERO_IMAGE = '/images/hero.jpg';
export const HERO_FALLBACK = '/images/hero-placeholder.jpg';

export function HeroImage() {
  const [src, setSrc] = useState(HERO_IMAGE);
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className={`hero-figure ${loaded ? 'loaded' : ''}`}>
      <img
        src={src}
        alt="أشخاص ينتظرون في طابور لتعبئة حاويات مياه الشرب"
        width={1280}
        height={800}
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        onError={() => (src === HERO_IMAGE ? setSrc(HERO_FALLBACK) : setLoaded(true))}
      />
      <figcaption>كل قطرة يجب أن تصل إلى من يحتاجها أولًا</figcaption>
    </figure>
  );
}
