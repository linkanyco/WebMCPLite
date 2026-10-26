import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  envDir: false,
  publicDir: false,
  server: {
    host: '127.0.0.1',
    port: Number(process.env.PORT || 4173),
    strictPort: true,
  },
  build: {
    assetsInlineLimit: 0,
    sourcemap: false,
    rolldownOptions: {
      onLog(level, log, defaultHandler) {
        // This browser-only app does not use React Server Component boundaries.
        if (log.code === 'MODULE_LEVEL_DIRECTIVE' && log.message.includes('"use client"')) return;
        defaultHandler(level, log);
      },
    },
  },
});
