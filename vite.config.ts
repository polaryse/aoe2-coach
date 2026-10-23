import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Electron loads the production build over file://, so packaged assets must
  // resolve relative to index.html instead of from the filesystem root.
  base: './',
  plugins: [react()],
});
