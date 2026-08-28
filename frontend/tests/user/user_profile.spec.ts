import { test, expect } from "@playwright/test"
import {signUp, Delete, MakeUser} from "../helper/auths"


test("user profile allow user to update account information and delete user account", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();

    try {
        await signUp(page, user)

        await page.getByRole("link", {name: "Setting"}).click()
        await expect(page).toHaveURL(/\/setting/)

        await expect(
            page.getByRole("heading", {
                name: "Account Settings",
            })
        ).toBeVisible

        await page.getByLabel("email").fill("Another@email.com")
        await page.getByLabel("username").fill("Another Name")
        await page.getByLabel("password").fill("87654321")

        await page.getByRole("button", {name: "Save changes"}).click()
        await expect(
            page.getByText("Account updated successfully")
        ).toBeVisible()

        await page.getByRole("button", { name: "Log-Out"}).first().click()

        await expect(page).toHaveURL(/\/$/)

        await page.pause()
        
        await expect(page.getByRole("button", {name:"Log In"})).toBeVisible()

        await page.getByRole("button", { name: "Log In"}).click()

        await expect(page.getByRole("dialog")).toBeVisible()
        
        await expect(
        page.getByRole("heading", { name: "Log in to your Account" })
        ).toBeVisible()

        await page.getByLabel("Email").fill("Another@email.com")
        await page.getByLabel("Password").fill("87654321")
        await page.getByRole("button", { name: "Log In" }).click()

        await expect(page).toHaveURL(/dashboard/)
        const token = await page.evaluate(() =>
            localStorage.getItem("access_token"))
        expect(token).not.toBeNull()
        
        await page.pause()
    } finally {
        await Delete(page, user)
    }
})