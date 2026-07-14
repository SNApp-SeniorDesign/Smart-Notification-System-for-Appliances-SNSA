import { test, expect} from "@playwright/test"
import {signUp, Delete, MakeUser} from "./auths"


test("user can log out their account", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();
    await signUp(page, user)
    await page.getByRole("button", { name: "Log-Out"}).first().click()
    await expect(
        page.getByText(/Log Out Successfully|Logged out/i)
    ).toBeVisible()

    await expect(page).toHaveURL(/\/$/)
    await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("token")) 
    }).toBeNull()


    await Delete(page, user)
})