import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
// Replace src/assets/images/hero.webp with your photo (see src/assets/images/README.md).
// vite-imagetools turns that one file into 640/960/1280/1600px WebP variants with hashed names at build time.
import heroSrcSet from '../../assets/images/hero.webp?w=640;960;1280;1600&format=webp&as=srcset';
import heroSrc from '../../assets/images/hero.webp?w=1280&format=webp';

/** Hero photo: responsive srcset, reserved space (no layout shift), shimmer until loaded */
export function HeroImage() {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish loading before React attaches onLoad
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <figure className={`hero-figure ${loaded ? 'loaded' : ''}`}>
      <img
        ref={ref}
        src={heroSrc}
        srcSet={heroSrcSet}
        sizes="(max-width: 860px) 100vw, 50vw"
        alt={t("أشخاص ينتظرون في طابور لتعبئة حاويات مياه الشرب")}
        width={1600}
        height={1000}
        decoding="async"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      <figcaption>{t("كل قطرة يجب أن تصل إلى من يحتاجها أولًا")}</figcaption>
    </figure>
  );
}
