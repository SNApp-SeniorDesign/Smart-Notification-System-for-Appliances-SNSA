import { test, expect } from "@playwright/test"
import {signUp, Delete, MakeUser, LogOut} from "./auths"


test("user can log in and reach dashboard", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();

    try {
        await signUp(page, user)
        await LogOut(page, user)
        await expect(page).toHaveURL(/\/$/)
        
        await expect(page.getByRole("button", {name:"Log In"})).toBeVisible()
        

        await page.getByRole("button", { name: "Log In"}).click()

        await expect(page.getByRole("dialog")).toBeVisible()
        
        await expect(
        page.getByRole("heading", { name: "Log in to your Account" })
        ).toBeVisible()

        await page.getByLabel("Email").fill(user.email)
        await page.getByLabel("Password").fill(user.password)

        await page.getByRole("button", { name: "Log In" }).click()

        await expect(page).toHaveURL(/dashboard/)
        const token = await page.evaluate(() =>
            localStorage.getItem("access_token"))
        expect(token).not.toBeNull()
    } finally {
        await Delete(page, user)
    }



})