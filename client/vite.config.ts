import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env =
    mode === "production" ? {} : loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    // Production is same-origin and must not inherit local configuration.
    envDir: mode === "production" ? false : undefined,
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT ?? 5173),
      strictPort: true,
      proxy: { "/api": env.VITE_API_PROXY_TARGET ?? "http://localhost:4000" },
    },
  };
});
