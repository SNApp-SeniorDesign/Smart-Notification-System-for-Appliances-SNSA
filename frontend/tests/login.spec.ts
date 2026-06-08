import { test, expect} from "@playwright/test"

test("user can log in and reach dashboard", async ({ page }) => {

    await page.goto("/")

    await page.getByRole("button", { name: "Log In"}).first().click()

    await page.getByLabel("Email").fill("user@example.com")
    await page.getByLabel("Password").fill("12345678")
    await page.getByRole("button", { name: "Log In" }).last().click()

    const token = await page.evaluate(() =>
        localStorage.getItem("access_token"))
    expect(token).not.toBeNull()
    await expect(page.getByText("Login successful")).toBeVisible()
})