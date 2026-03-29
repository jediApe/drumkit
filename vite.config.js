import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react")) return "react-vendor";
          if (id.includes("framer-motion")) return "motion-vendor";
          if (id.includes("@supabase/supabase-js")) return "supabase-vendor";
          return "vendor";
        },
      },
    },
  },
});
