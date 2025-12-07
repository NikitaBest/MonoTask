import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  plugins: [
    react(),
    // Runtime error overlay только в development
    ...(process.env.NODE_ENV !== "production" ? [runtimeErrorOverlay()] : []),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React и React DOM
          if (id.includes("react") || id.includes("react-dom")) {
            return "vendor-react";
          }
          // React Router
          if (id.includes("wouter")) {
            return "vendor-router";
          }
          // Radix UI компоненты
          if (id.includes("@radix-ui")) {
            return "vendor-ui";
          }
          // State management
          if (id.includes("zustand") || id.includes("@tanstack/react-query")) {
            return "vendor-state";
          }
          // Charts
          if (id.includes("recharts")) {
            return "vendor-charts";
          }
          // Date utilities
          if (id.includes("date-fns")) {
            return "vendor-date";
          }
          // Forms
          if (id.includes("react-hook-form") || id.includes("zod")) {
            return "vendor-forms";
          }
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
