# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 0-signin.spec.ts >> test user can sign in or already exists
- Location: tests/0-signin.spec.ts:3:0

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Account created - please log in to continue|already exists/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "to.be.visible" with timeout 5000ms
  - waiting for getByText(/Account created - please log in to continue|already exists/i)

```

```yaml
- region "Notifications alt+T"
- dialog "Create your Account":
  - heading "Create your Account" [level=2]
  - paragraph: Enter your email, username, and password to create an account
  - text: Create your account Enter your information to create your account
  - group:
    - text: Email
    - textbox "Email":
      - /placeholder: m@example.com
      - text: test@gmail.com
  - group:
    - text: Username
    - textbox "Username":
      - /placeholder: exampleName
      - text: tester
  - group:
    - text: Password
    - textbox "Password": "12345678"
  - group:
    - button "Sign Up"
  - button "Close"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test("test user can sign in or already exists", async ({ page }) => {
  4  |     
  5  |     await page.goto("/")
  6  | 
  7  |     await page.getByRole("button", {name: "Sign Up"}).first().click()
  8  | 
  9  |     await page.getByLabel("Email").fill("test@gmail.com")
  10 |     await page.getByLabel("Username").fill("tester")
  11 |     await page.getByLabel("Password", { exact: true }).fill("12345678")
  12 |     
  13 |     await page.getByRole("button", {name: "Sign Up"}).click()
  14 | 
> 15 |     await expect(page.getByText(/Account created - please log in to continue|already exists/i)).toBeVisible()
     |                                                                                                ^ Error: expect(locator).toBeVisible() failed
  16 | })
```