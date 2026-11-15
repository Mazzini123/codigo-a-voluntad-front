import { defineConfig, devices } from "@playwright/test";

const SESIONES = [
  { proyecto: "visitante", sesion: "", puerto: 5181 },
  { proyecto: "sin-perfil", sesion: "SIN_PERFIL", puerto: 5182 },
  { proyecto: "colaboradora", sesion: "COLABORADORA", puerto: 5183 },
  { proyecto: "colectivo", sesion: "COLECTIVO", puerto: 5184 },
];

const url = (puerto) => `http://localhost:${puerto}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    ...devices["Desktop Chrome"],
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.CHROME_PATH || undefined },
  },
  projects: SESIONES.map(({ proyecto, puerto }) => ({
    name: proyecto,
    testMatch: `${proyecto}/**/*.spec.js`,
    use: { baseURL: url(puerto) },
  })),
  webServer: SESIONES.map(({ sesion, puerto }) => ({
    command: `npx vite --port ${puerto} --strictPort`,
    url: url(puerto),
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      VITE_SESION_SIMULADA: sesion,
      VITE_SESION_SIMULADA_PERFIL_ID: "",
      VITE_LOGTO_ENDPOINT: "",
      VITE_API_BASE_URL: "/api",
    },
  })),
});
