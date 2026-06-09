# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> user can log in and reach dashboard
- Location: tests/login.spec.ts:5:0

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#email')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - heading "Welcome to the Home Page" [level=1] [ref=e3]
  - button "Sign Up" [active] [ref=e4]
  - button "Log In" [ref=e5]
  - button "Delete Account" [ref=e6]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e12] [cursor=pointer]:
    - img [ref=e13]
  - alert [ref=e16]
```

# Test source

```ts
  1  | import {Page, expect } from "@playwright/test"
  2  | 
  3  | 
  4  | export function MakeUser(){
  5  |     const id = Date.now() + Math.floor(Math.random() * 10000);
  6  |     return {
  7  |         email: `user-${id}@example.com`,
  8  |         username: `tester-${id}`,
  9  |         password: "12345678"
  10 |     }
  11 | }
  12 | 
  13 | 
  14 | export async function signUp(page: Page, user: ReturnType<typeof MakeUser>){
  15 | 
  16 |     const SigninButton =  await page.getByRole("button", {name: "Sign Up"}).first()
  17 |     await expect(SigninButton).toBeVisible()
  18 |     await expect(SigninButton).toBeEnabled()
  19 |     await SigninButton.click();
  20 | 
  21 | 
  22 | 
  23 |     await page.getByRole("button", { name: "Sign Up" }).first().click();
> 24 |     await page.locator("#email").fill(user.email);
     |                                 ^ Error: fill: Test timeout of 30000ms exceeded.
  25 |     await page.locator("#username").fill(user.username);
  26 |     await page.locator("#password").fill(user.password);
  27 |     await page.getByRole("button", { name: "Sign Up" }).last().click();
  28 | 
  29 |     await expect(page.getByRole("dialog")).not.toBeVisible()
  30 |     
  31 | 
  32 | }
  33 | 
  34 | export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
  35 |     
  36 |     const LoginButton = await page.getByRole("button", { name: "Log In" }).first()
  37 |     await expect(LoginButton).toBeVisible()
  38 |     await expect(LoginButton).toBeEnabled()
  39 |     await LoginButton.click();
  40 | 
  41 |     await expect(
  42 |     page.getByRole("heading", { name: "Log in to your account" })
  43 |     ).toBeVisible();
  44 | 
  45 |     await page.locator("#email").fill(user.email);
  46 |     await page.locator("#password").fill(user.password);
  47 |     await page.getByRole("button", { name: "Log In" }).last().click();
  48 | 
  49 |     await expect(page.getByText("Login successful")).toBeVisible()
  50 |     
  51 |     await expect(page.getByRole("dialog")).not.toBeVisible()
  52 | 
  53 | }
  54 | 
  55 | export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
  56 |     await page.getByRole("button", { name: "Delete Account" }).first().click();
  57 | 
  58 |     page.on("dialog", async(dialog) => {
  59 |         expect(dialog.message()).toContain("Are you sure you want to delete your account? This action cannot be undone.")
  60 |         await dialog.accept()
  61 |     })
  62 | }
```