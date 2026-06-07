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
  - generic [ref=e11] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e12]:
      - img [ref=e13]
    - generic [ref=e16]:
      - button "Open issues overlay" [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: "0"
          - generic [ref=e20]: "1"
        - generic [ref=e21]: Issue
      - button "Collapse issues badge" [ref=e22]:
        - img [ref=e23]
  - alert [ref=e25]
  - dialog "Log in to your Account" [ref=e29]:
    - generic [ref=e30]:
      - heading "Log in to your Account" [level=2] [ref=e31]
      - paragraph [ref=e32]: Enter your email and password to log in to your account
    - generic [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]: Log in to your account
        - generic [ref=e37]: Enter your information to log in to your account
      - generic [ref=e40]:
        - group [ref=e41]:
          - generic [ref=e42]: Email
          - textbox "Email" [ref=e43]:
            - /placeholder: m@example.com
            - text: user@example.com
        - group [ref=e44]:
          - generic [ref=e46]: Password
          - textbox "Password" [ref=e47]: password
        - group [ref=e48]:
          - button "Log In" [active] [ref=e49]
    - button "Close" [ref=e50]:
      - img
      - generic [ref=e51]: Close
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