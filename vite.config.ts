
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: true, // Forces allowed directories ONLY
    },
    hmr: {
      // Configure explicit HMR settings to prevent unexpected identifiers
      protocol: 'ws',
      host: 'localhost',
      port: 24678, // Default HMR port for Vite
      overlay: false, // Disable the error overlay that could cause issues
    },
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "ca760ad3-2f64-4134-9279-88c7538fb3cf.lovableproject.com"
    ],
  },
  optimizeDeps: {
    exclude: ['nanoid'], // Force using latest nanoid build tree
  },
  build: {
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 2000, // Increase chunk warning limit
    minify: mode === 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@/components/ui'],
          shadcn: ['@radix-ui'],
          utils: ['@/lib/utils']
        }
      }
    }
  },
  define: {
    // Define the WebSocket token for HMR - with fallback
    __WS_TOKEN__: JSON.stringify(process.env.VITE_WS_TOKEN || "dev-ws-token")
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
