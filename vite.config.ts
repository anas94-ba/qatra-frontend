import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

const config = {
  // imagetools builds resized, hashed WebP variants for imports such as hero.webp?w=640;960&format=webp&as=srcset
  plugins: [react(), imagetools()],
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: false,
  },
};

export default defineConfig(config);
