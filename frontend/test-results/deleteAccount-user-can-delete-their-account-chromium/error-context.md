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
  - region "Notifications alt+T":
    - list
    - list:
      - listitem [ref=e7]:
        - img [ref=e9]
        - generic [ref=e12]: "Login failed: Unknown error"
  - button "Open Next.js Dev Tools" [ref=e18] [cursor=pointer]:
    - img [ref=e19]
  - alert [ref=e22]
  - dialog "Log in to your Account" [ref=e26]:
    - generic [ref=e27]:
      - heading "Log in to your Account" [level=2] [ref=e28]
      - paragraph [ref=e29]: Enter your email and password to log in to your account
    - generic [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]: Log in to your account
        - generic [ref=e34]: Enter your information to log in to your account
      - generic [ref=e37]:
        - group [ref=e38]:
          - generic [ref=e39]: Email
          - textbox "Email" [ref=e40]:
            - /placeholder: m@example.com
            - text: user@example.com
        - group [ref=e41]:
          - generic [ref=e43]: Password
          - textbox "Password" [ref=e44]: password
        - group [ref=e45]:
          - button "Log In" [active] [ref=e46]
    - button "Close" [ref=e47]:
      - img
      - generic [ref=e48]: Close
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
  20 |     await page.getByLabel("Password").fill("password")
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