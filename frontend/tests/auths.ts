import {Page, expect } from "@playwright/test"


export function MakeUser(){
    const id = Date.now() + Math.floor(Math.random() * 10000);
    return {
        email: `user-${id}@example.com`,
        username: `tester-${id}`,
        password: "12345678"
    }
}


export async function signUp(page: Page, user: ReturnType<typeof MakeUser>){
    await page.goto("/")

    await page.getByRole("button", { name: "Sign Up" }).first().click();
    await page.locator("#email").fill(user.email);
    await page.locator("#username").fill(user.username);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Sign Up" }).last().click();

}

export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
    await page.goto("/")
    
    await page.getByRole("button", { name: "Log In" }).first().click();
    await page.locator("#email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Log In" }).last().click();

    const token = await page.evaluate(() =>
        localStorage.getItem("access_token")
    );

    expect(token).not.toBeNull();

}

export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
    await page.goto("/")
    await page.getByRole("button", { name: "Delete Account" }).first().click();

}