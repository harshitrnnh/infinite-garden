import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        tabletBloom: resolve(import.meta.dirname, 'tablet-bloom.html'),
        visualLab: resolve(import.meta.dirname, 'visual-lab.html'),
        flowerGeometries: resolve(import.meta.dirname, 'flower-geometries.html')
      }
    }
  }
});
