import { defineConfig, devices } from "@playwright/test"

const isProduction = process.env.E2E_TARGET === "production"

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: isProduction
      ? "https://smart-notification-dystem-for-appliances-snsa.snsa-app.workers.dev"
      : "http://localhost:3000",

    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  webServer: isProduction
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  workers: 1,
})