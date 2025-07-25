import { defineConfig } from 'vite';
import { createServer } from 'vite'
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/carboncalculus",
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: false
    }
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      console.log('Request:', req.url);
      next();
    });
  }
});

