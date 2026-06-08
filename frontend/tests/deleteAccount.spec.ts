import { test, expect, Page} from "@playwright/test"
import {signUp, Login , MakeUser} from "./auths"
test("user can delete their account", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();
    await signUp(page, user)
    await Login(page, user)

    await page.getByRole("button", { name: "Delete Account" }).last().click()

    await expect(page.getByText("Account deleted successfully")).toBeVisible()
})
