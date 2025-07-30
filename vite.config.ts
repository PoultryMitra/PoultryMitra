import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      external: [],
      onwarn(warning, warn) {
        // Suppress warnings about missing exports when using namespace imports
        if (warning.code === 'MISSING_EXPORT' && warning.message?.includes('dealerService')) {
          return;
        }
        warn(warning);
      }
    },
  },
  preview: {
    port: 8080,
    host: "::",
  },
}));
