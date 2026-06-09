import { test, expect } from "@playwright/test";
import { MakeUser, signUp, Login } from "./auths";

test("user can delete their account", async ({ page }) => {
  const user = MakeUser();

  await signUp(page, user);
  await Login(page, user);

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain(
      "Are you sure you want to delete your account?"
    );

    await dialog.accept();
  });

  await page.getByRole("button", { name: "Delete Account" }).click();

  await expect(
    page.getByText(/Account deleted successfully/i)
  ).toBeVisible();
});