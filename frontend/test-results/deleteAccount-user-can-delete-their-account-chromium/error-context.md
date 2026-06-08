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
            - text: user@example.com
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
  1  | import { test, expect, Page} from "@playwright/test"
  2  | 
  3  | test("user can delete their account", async ({ page }) => {
  4  | 
  5  |     await page.goto("/")
  6  | 
  7  |     await login(page)
  8  | 
  9  |     await page.getByRole("button", { name: "Delete Account" }).last().click()
  10 | 
  11 |     await expect(page.getByText("Account deleted successfully")).toBeVisible()
  12 | })
  13 | 
  14 | async function login(page: Page){
  15 |     await page.goto("/")
  16 | 
  17 |     await page.getByRole("button", { name: "Log In"}).first().click()
  18 | 
  19 |     await page.getByLabel("Email").fill("user@example.com")
  20 |     await page.getByLabel("Password").fill("12345678")
  21 |     await page.getByRole("button", { name: "Log In" }).last().click()
  22 | 
  23 | 
  24 |     const token = await page.evaluate(() =>
  25 |         localStorage.getItem("access_token"))
  26 |     
> 27 |     expect(token).not.toBeNull()
     |                      ^ Error: expect(received).not.toBeNull()
  28 |     await expect(page.getByText("Login successful")).toBeVisible()
  29 | }
```