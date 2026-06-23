import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    include: [
      "src/tests/**/*.test.ts",
      "src/tests/**/*.test.tsx",
    ],
    exclude: ["node_modules", ".next", "dist", "src/tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts", "src/services/**/*.ts", "src/repositories/**/*.ts"],
      exclude: ["src/types/**", "**/*.test.ts", "**/*.test.tsx"],
    },
  },
  resolve: {
    alias: [
      { find: "@/lib", replacement: path.resolve(__dirname, "src/lib") },
      { find: "@/components", replacement: path.resolve(__dirname, "src/components") },
      { find: "@/features", replacement: path.resolve(__dirname, "src/features") },
      { find: "@/services", replacement: path.resolve(__dirname, "src/services") },
      { find: "@/repositories", replacement: path.resolve(__dirname, "src/repositories") },
      { find: "@/utils", replacement: path.resolve(__dirname, "src/utils") },
      { find: "@", replacement: path.resolve(__dirname, ".") },
    ],
  },
});
