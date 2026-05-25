import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works on GitHub Pages (project site),
// any sub-path, and even when opening the built index.html directly.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
