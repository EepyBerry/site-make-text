import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

function vuePlugin() {
  return vue({
    template: {
      compilerOptions: {
        isCustomElement: tag => ['highlightjs'].includes(tag)
      }
    }
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vuePlugin(), nodePolyfills({ include: ['buffer', 'fs', 'path'], globals: { Buffer: true } })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
