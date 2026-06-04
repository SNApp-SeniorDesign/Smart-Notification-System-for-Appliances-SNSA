import { test, expect } from "@playwright/test"

test("test user can sign in or already exists", async ({ page }) => {
    
    await page.goto("/")

    await page.getByRole("button", {name: "Sign Up"}).first().click()

    await page.getByLabel("Email").fill("test@gmail.com")
    await page.getByLabel("Username").fill("tester")
    await page.getByLabel("Password", { exact: true }).fill("12345678")
    
    await page.getByRole("button", {name: "Sign Up"}).click()

    await expect(page.getByText("sucess|created|registered|already exists/i")).toBeVisible()
})