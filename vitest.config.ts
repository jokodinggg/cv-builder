import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

if (existsSync(".env")) process.loadEnvFile(".env");
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    // DB tests always run against the dedicated test database, never the dev one.
    env: testDatabaseUrl ? { TEST_DATABASE_URL: testDatabaseUrl, DATABASE_URL: testDatabaseUrl, DIRECT_URL: testDatabaseUrl } : {},
  },
});
