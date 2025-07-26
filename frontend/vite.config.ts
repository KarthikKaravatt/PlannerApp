import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { tanstackRouter } from '@tanstack/router-plugin/vite'
const ReactCompilerConfig = {
  /* ... */
};
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: 'react-vendor',
              test: /\/node_modules\/(react|react-dom)\//
            },
            {
              name: 'router-vendor',
              test: /\/node_modules\/@tanstack\//
            },
            {
              name: 'redux-vendor',
              test: /\/node_modules\/(redux|@reduxjs|immer)\//
            }
          ]
        }
      }
    }
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    viteReact({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
