import { defineConfig } from "@playwright/test";
export default defineConfig({
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:9004",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  testDir: "tests/browser",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:9004",
    headless: true,
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      },
    },
  ],
});
