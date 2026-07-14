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

    await page.getByRole("button", { name: "Sign Up"}).first().click()
    
    await expect(
      page.getByRole("heading", { name: "Create your SNSA Account" })
    ).toBeVisible();

    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Username").fill(user.username)
    await page.getByLabel("Password", { exact: true }).fill(user.password)
    await page.getByLabel("Confirm Password").fill(user.password)

    await page.getByRole("button", {name: "Sign Up"}).click()

    await expect(page.getByText("Account created - welcome")).toBeVisible()

    await expect(page.getByRole("dialog")).not.toBeVisible()

    await expect(page).toHaveURL(/\/dashboard/)
}

export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
    
    const LoginButton = await page.getByRole("button", { name: "Log In" }).first()
    await expect(LoginButton).toBeVisible()
    await expect(LoginButton).toBeEnabled()
    await LoginButton.click();

    await expect(
    page.getByRole("heading", { name: "Log in to your Account" })
    ).toBeVisible();

    await page.locator("#email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Log In" }).last().click();

    await expect(page.getByText("Login successful")).toBeVisible()
    
    await expect(page.getByRole("dialog")).not.toBeVisible()

}

export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
    await page.getByRole("link", { name: "Setting"}).click()
    await expect(page).toHaveURL(/\/setting/)

    page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain(
        "Are you sure you want to delete your account?"
        );

        await dialog.accept();
    });

    await page.getByRole("button", { name: "Delete Account" }).click();

    await expect(
        page.getByText(/Account deleted successfully/i)
    ).toBeVisible();

    await expect(page).toHaveURL(/\/$/)

    await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("token"))
    }).toBeNull()
}

export async function LogOut(page: Page, user: ReturnType<typeof MakeUser>){
    
    await expect(page).toHaveURL(/dashboard/)
    await page.getByRole("button", { name: "Log-Out"}).first().click()
    await expect(
        page.getByText(/Log Out Successfully|Logged out/i)
    ).toBeVisible()

    await expect(page).toHaveURL(/\/$/)
    await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("token")) 
    }).toBeNull()
}