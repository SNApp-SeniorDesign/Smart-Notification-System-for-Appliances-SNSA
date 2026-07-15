import { test, expect} from "@playwright/test"
import {signUp, Delete, MakeUser, Login} from "./auths"


test("user can log out their account", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();
    await signUp(page, user)
    await page.getByRole("button", { name: "Log-Out"}).first().click()

    await expect(page).toHaveURL(/\/$/)
   
    await expect(page.getByRole("button", {name: "Log-Out"})).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Log In"})).toBeVisible()

    await Login(page, user)
    await Delete(page, user)
})