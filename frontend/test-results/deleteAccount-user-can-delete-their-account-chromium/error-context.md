# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deleteAccount.spec.ts >> user can delete their account
- Location: tests/deleteAccount.spec.ts:3:0

# Error details

```
Error: expect(received).not.toBeNull()

Received: null
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - heading [level=1] [ref=e3]: Welcome to the Home Page
  - button [ref=e4]: Sign Up
  - button [expanded] [ref=e5]: Log In
  - button [ref=e6]: Delete Account
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e12] [cursor=pointer]:
    - img [ref=e13]
  - alert [ref=e16]
  - dialog "Log in to your Account" [ref=e20]:
    - generic [ref=e21]:
      - heading "Log in to your Account" [level=2] [ref=e22]
      - paragraph [ref=e23]: Enter your email and password to log in to your account
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]: Log in to your account
        - generic [ref=e28]: Enter your information to log in to your account
      - generic [ref=e31]:
        - group [ref=e32]:
          - generic [ref=e33]: Email
          - textbox "Email" [ref=e34]:
            - /placeholder: m@example.com
            - text: user-1780957017071@example.com
        - group [ref=e35]:
          - generic [ref=e37]: Password
          - textbox "Password" [ref=e38]: "12345678"
        - group [ref=e39]:
          - button "Log In" [active] [ref=e40]
    - button "Close" [ref=e41]:
      - img
      - generic [ref=e42]: Close
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
  15 |     await page.goto("/")
  16 | 
  17 |     await page.getByRole("button", {name: "Sign Up"}).first().click()
  18 | 
  19 |     await page.getByRole("button", { name: "Sign Up" }).first().click();
  20 |     await page.locator("#email").fill(user.email);
  21 |     await page.locator("#username").fill(user.username);
  22 |     await page.locator("#password").fill(user.password);
  23 |     await page.getByRole("button", { name: "Sign Up" }).last().click();
  24 | 
  25 | }
  26 | 
  27 | export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
  28 |     await page.goto("/")
  29 |     
  30 |     await page.getByRole("button", { name: "Log In" }).first().click();
  31 | 
  32 |     await expect(
  33 |     page.getByRole("heading", { name: "Log in to your account" })
  34 |     ).toBeVisible();
  35 | 
  36 |     await page.locator("#email").fill(user.email);
  37 |     await page.locator("#password").fill(user.password);
  38 |     await page.getByRole("button", { name: "Log In" }).last().click();
  39 | 
  40 |     const token = await page.evaluate(() =>
  41 |         localStorage.getItem("access_token")
  42 |     );
  43 | 
> 44 |     expect(token).not.toBeNull();
     |                      ^ Error: expect(received).not.toBeNull()
  45 | 
  46 | }
  47 | 
  48 | export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
  49 |     await page.goto("/")
  50 |     await page.getByRole("button", { name: "Delete Account" }).first().click();
  51 | 
  52 | }
```