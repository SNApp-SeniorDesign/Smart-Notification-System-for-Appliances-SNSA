import { test, expect } from "@playwright/test";
import { MakeUser, signUp} from "./auths";

test("user can delete their account", async ({ page }) => {
  
    await page.goto("/")
    const user = MakeUser();

    await signUp(page, user);

    
    await page.getByRole("link", { name: "Setting" }).click()
  await expect(page).toHaveURL(/\/setting/)

  page.once("dialog", async dialog => {
    expect(dialog.message()).toContain(
      "Are you sure you want to delete your account?"
    )

    await dialog.accept()
  })

  const [deleteResponse] = await Promise.all([
    page.waitForResponse(response => {
      const url = new URL(response.url())

      return (
        response.request().method() === "DELETE" &&
        url.pathname === "/users/me"
      )
    }),

    page
      .getByRole("button", { name: "Delete Account" })
      .click(),
  ])

  expect(
    deleteResponse.status(),
    "Delete endpoint should return 204"
  ).toBe(204)

  await expect(page).toHaveURL(/\/$/)

  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("access_token")
      )
    )
    .toBeNull()
});