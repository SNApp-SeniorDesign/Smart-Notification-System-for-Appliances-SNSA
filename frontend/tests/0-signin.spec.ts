import { test, expect } from "@playwright/test"
import {Delete, MakeUser} from "./auths"

test("test user can sign up, auto-login, close dialog, and go to dashboard", async ({ page }) => {
    
    await page.goto("/")

    await page.getByRole("button", { name: "Sign Up"}).first().click()
    
    await expect(
      page.getByRole("heading", { name: "Create your SNSA Account" })
    ).toBeVisible();


    const user = MakeUser();
    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Username").fill(user.username)
    await page.getByLabel("Password", { exact: true }).fill(user.password)
    await page.getByLabel("Confirm Password").fill(user.password)

    await page.getByRole("button", {name: "Sign Up"}).click()

    await expect(page.getByText("Account created - welcome")).toBeVisible()

    await expect(page.getByRole("dialog")).not.toBeVisible()

    await expect(page).toHaveURL(/\/dashboard/)
    
    await Delete(page, user)
})