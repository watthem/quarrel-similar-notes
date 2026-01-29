import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      obsidian: path.resolve(__dirname, "tests/obsidian-mock.ts"),
    },
  },
  test: {
    environment: "node",
  },
});
