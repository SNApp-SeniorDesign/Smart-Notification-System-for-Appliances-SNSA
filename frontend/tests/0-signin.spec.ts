import { test, expect } from "@playwright/test"
import {Login, Delete, MakeUser} from "./auths"

test("test user can sign in or already exists", async ({ page }) => {
    
    await page.goto("/")

    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible()

    const user = MakeUser();
    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Username").fill(user.username)
    await page.getByLabel("Password", { exact: true }).fill(user.password)

    await page.getByRole("button", {name: "Sign Up"}).click()

    await expect(page.getByText(/Account created - please log in to continue|already exists/i)).toBeVisible()

    await expect(page.getByRole("dialog")).not.toBeVisible()

    await Login(page, user)
    await Delete(page, user)
})