# Home page hero image

Put your photo here as **`hero.jpg`** (exact name, lowercase):

    public/images/hero.jpg

- Recommended: 1600 x 1000 px (16:10), JPG or WebP data saved as .jpg, **under 300 KB** (compress it, e.g. squoosh.app).
- Landscape photos work best; the image is cropped to 16:10 on desktop and 4:3 on phones (`object-fit: cover`),
  so keep the important subject near the middle.
- If `hero.jpg` is missing, `hero-placeholder.jpg` (an illustration) is shown instead.
- Use a photo you own or have permission to publish; photos of identifiable people, especially children,
  should only be used with consent.
- In Docker the `public/` folder is baked into the image: rebuild after changing the file, or mount it:
  `docker run -v $(pwd)/hero.jpg:/usr/share/nginx/html/images/hero.jpg ...`
- Change the alt text and caption in `src/features/public/HeroImage.tsx`.
