import { test, expect} from "@playwright/test"
import {signUp, Delete, MakeUser} from "./auths"


test("user can log in and reach dashboard", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();
    await signUp(page, user)
    await page.getByRole("button", { name: "Log In"}).first().click()

    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Password").fill(user.password)
    await page.getByRole("button", { name: "Log In" }).last().click()

    const token = await page.evaluate(() =>
        localStorage.getItem("access_token"))
    expect(token).not.toBeNull()
    await expect(page.getByText("Login successful")).toBeVisible()

    await Delete(page, user)
})