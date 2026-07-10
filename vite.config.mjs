import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  optimizeDeps: {
    noDiscovery: true,
    include: ["react", "react-dom/client"],
  },
});
