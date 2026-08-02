# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 0-signin.spec.ts >> test user can sign up, auto-login, close dialog, and go to dashboard
- Location: tests/0-signin.spec.ts:4:0

# Error details

```
Error: _expect: Test ended.
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | import {Delete, MakeUser} from "./auths"
  3  | 
  4  | test("test user can sign up, auto-login, close dialog, and go to dashboard", async ({ page }) => {
  5  |     
  6  |     await page.goto("/")
  7  | 
  8  |     await page.getByRole("button", { name: "Sign Up"}).first().click()
  9  |     
  10 |     await expect(
  11 |       page.getByRole("heading", { name: "Create your SNSA Account" })
  12 |     ).toBeVisible();
  13 | 
  14 | 
  15 |     const user = MakeUser();
  16 |     await page.getByLabel("Email").fill(user.email)
  17 |     await page.getByLabel("Username").fill(user.username)
  18 |     await page.getByLabel("Password", { exact: true }).fill(user.password)
  19 |     await page.getByLabel("Confirm Password").fill(user.password)
  20 | 
  21 |     await page.getByRole("button", {name: "Sign Up"}).click()
  22 | 
> 23 |     await expect(page.getByText("Account created - welcome")).toBeVisible()
     |                                                              ^ Error: _expect: Test ended.
  24 | 
  25 |     await expect(page.getByRole("dialog")).not.toBeVisible()
  26 | 
  27 |     await expect(page).toHaveURL(/\/dashboard/)
  28 |     
  29 | 
  30 |     await Delete(page, user)
  31 | })
```