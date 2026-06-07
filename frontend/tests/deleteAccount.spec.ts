import { test, expect, Page} from "@playwright/test"

test("user can delete their account", async ({ page }) => {

    await page.goto("/")

    await login(page)

    await page.getByRole("button", { name: "Delete Account" }).last().click()

    await expect(page.getByText("Account deleted successfully")).toBeVisible()
})

async function login(page: Page){
    await page.goto("/")

    await page.getByRole("button", { name: "Log In"}).first().click()

    await page.getByLabel("Email").fill("user@example.com")
    await page.getByLabel("Password").fill("password")
    await page.getByRole("button", { name: "Log In" }).last().click()


    const token = await page.evaluate(() =>
        localStorage.getItem("access_token"))
    
    expect(token).not.toBeNull()
    await expect(page.getByText("Login successful")).toBeVisible()
}