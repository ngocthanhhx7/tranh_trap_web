import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  envDir: false,
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
    env: { VITE_API_URL: "/api/v1" },
    restoreMocks: true,
  },
});
