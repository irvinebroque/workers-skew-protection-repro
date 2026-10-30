import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [cloudflare()],
  publicDir: `fixtures/${mode === "b" ? "b" : "a"}`,
}));
