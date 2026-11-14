# Images bundled with the app

Everything here is imported from code, so Vite fingerprints it (`hero.3f9a1c.webp`) and nginx caches it for a year.

## Home page photo: `hero.webp`

Replace `hero.webp` (same name, WebP) with your photo. That single file is enough:
at build time `vite-imagetools` generates 640 / 960 / 1280 / 1600 px WebP variants and the browser picks the right one.

- Export it as **WebP, 1600 x 1000 px (16:10) or larger**, quality 75-80 (squoosh.app or `cwebp -q 78 photo.jpg -o hero.webp`).
- The image is cropped to 16:10 on desktop and 4:3 on phones (`object-fit: cover`): keep the subject near the middle.
- Use a photo you own or may publish; get consent for identifiable people, especially children.
- Alt text and caption: `src/features/public/HeroImage.tsx` (and `src/i18n/en.ts` for English).

## `logo.webp`

The emblem with a transparent background, used in the header, loaders and login pages.

## Icons (not here)

Favicons and app icons must keep fixed URLs, so they live in `public/`:
`favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.
