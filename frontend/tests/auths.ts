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

    await page.getByRole("button", {name: "Sign Up"}).first().click()

    await page.getByRole("button", { name: "Sign Up" }).first().click();
    await page.locator("#email").fill(user.email);
    await page.locator("#username").fill(user.username);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Sign Up" }).last().click();

    await expect(page.getByRole("dialog")).not.toBeVisible()
    

}

export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
    
    const LoginButton = await page.getByRole("button", { name: "Log In" }).first()
    await expect(LoginButton).toBeVisible()
    await expect(LoginButton).toBeEnabled()
    await LoginButton.click();

    await expect(
    page.getByRole("heading", { name: "Log in to your account" })
    ).toBeVisible();

    await page.locator("#email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Log In" }).last().click();

    await expect(page.getByText("Login successful")).toBeVisible()
    
    await expect(page.getByRole("dialog")).not.toBeVisible()

}

export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
    await page.getByRole("button", { name: "Delete Account" }).first().click();

}