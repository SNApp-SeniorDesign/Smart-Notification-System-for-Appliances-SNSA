import { test, expect } from "@playwright/test";
import { MakeUser, Delete, signUp } from "../helper/auths";

test("user can enable notifications", async ({ page }) => {
  const user = MakeUser();

  await page.addInitScript(() => {
    const mockSubscription = {
      endpoint: "https://playwright.test/push-endpoint",
      toJSON: () => ({
        endpoint: "https://playwright.test/push-endpoint",
        keys: {
          p256dh: "playwright-p256dh-key",
          auth: "playwright-auth-key",
        },
      }),
    };

    const mockRegistration = {
      pushManager: {
        getSubscription: async () => null,
        subscribe: async () => mockSubscription,
      },
    };

    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        permission: "granted",
        requestPermission: async () => "granted",
      },
    });

    Object.defineProperty(window, "PushManager", {
      configurable: true,
      value: function PushManager() {},
    });

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: async () => mockRegistration,
        ready: Promise.resolve(mockRegistration),
      },
    });
  });

  let savedSubscription: unknown;

  await page.route("**/notifications/subscribe", async (route) => {
    savedSubscription = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Push subscription created successfully",
        subscription_id: 1,
      }),
    });
  });

  try {
    await page.goto("/");

    await signUp(page, user);

    await page.getByRole("link", { name: "Settings" }).click();

    await expect(page).toHaveURL(/\/setting/);

    await page.getByRole("button", {
      name: "Enable Notifications",
    }).click();

    await expect(
      page.getByText("Notifications enabled")
    ).toBeVisible();

    expect(savedSubscription).toEqual({
      endpoint: "https://playwright.test/push-endpoint",
      keys: {
        p256dh: "playwright-p256dh-key",
        auth: "playwright-auth-key",
      },
    });
  } finally {
    await Delete(page, user);
  }
});