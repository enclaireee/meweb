import { defineConfig, devices } from "@playwright/test";

const swiftshader = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];

/** e2e against the production build (architecture.md §12). Run `npm run build` first. */
export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:3200" },
  projects: [
    // software WebGL, so the scene path runs headless too
    { name: "chromium", use: { ...devices["Desktop Chrome"], launchOptions: { args: swiftshader } }, grepInvert: /no WebGL/ },
    { name: "no-webgl", use: { ...devices["Desktop Chrome"], launchOptions: { args: ["--disable-webgl", "--disable-3d-apis"] } }, grep: /no WebGL/ },
  ],
  webServer: { command: "npx next start -p 3200", url: "http://localhost:3200", reuseExistingServer: true, timeout: 60_000 },
});
