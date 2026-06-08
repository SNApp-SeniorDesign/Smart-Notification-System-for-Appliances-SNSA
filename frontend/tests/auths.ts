import {Page, expect } from "@playwright/test"

export async function signUpAndLogin(page: Page){
    const email = `user-${Date.now()}@example.com`
    const username = `tester-${Date.now()}`
    const password = '12345678'

    await page.goto("/")

    await page.getByRole("button", { name: "Sign Up" }).first().click();
    await page.locator("#email").fill(email);
    await page.locator("#username").fill(username);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Sign Up" }).last().click();

    await page.getByRole("button", { name: "Log In" }).first().click();
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "Log In" }).last().click();

    const token = await page.evaluate(() =>
        localStorage.getItem("access_token")
    );

    expect(token).not.toBeNull();

    return { email, username, password, token };
}