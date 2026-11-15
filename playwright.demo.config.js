import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/demo",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://localhost:5174",
    locale: "es-AR",
    launchOptions: { executablePath: process.env.CHROME_PATH || undefined },
  },
  webServer: {
    command: "npm run demo -- --strictPort",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
  },
});
