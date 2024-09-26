import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';
import commonjs from "vite-plugin-commonjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), commonjs()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true } // Change
  }
})
