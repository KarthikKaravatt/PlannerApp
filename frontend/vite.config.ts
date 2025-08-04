import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { tanstackRouter } from "@tanstack/router-plugin/vite";



// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            {
              name: 'router-vendor',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
            },
            {
              name: 'react-aria-vendor',
              test: /[\\/]node_modules[\\/](@react-aria)[\\/]/,
            },
            {
              name: 'react-aria-components-vendor',
              test: /[\\/]node_modules[\\/](react-aria-components)[\\/]/,
            },
            {
              name: "react-aria-utilities-vendor",
              test: /[\\/]node_modules[\\/](@react-stately|@internationalized|clsx|)[\\/]/,
            },
            {
              name: "react-icons-vendor",
              test: /[\\/]node_modules[\\/](react-icons)[\\/]/,
            },
            {
              name: "redux-vendor",
              test: /[\\/]node_modules[\\/](@reduxjs\/toolkit|immer|react-redux)[\\/]/,
            },
            {
              name: "utilities-vendor",
              test: /[\\/]node_modules[\\/](zod|uuid)[\\/]/,
            }
          ],
        },
      },
    },
  },
  plugins: [
    // unstableRolldownAdapter(analyzer()),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
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
