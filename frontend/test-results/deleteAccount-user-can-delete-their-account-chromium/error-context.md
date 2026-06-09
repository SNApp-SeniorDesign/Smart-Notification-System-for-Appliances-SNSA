# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deleteAccount.spec.ts >> user can delete their account
- Location: tests/deleteAccount.spec.ts:3:0

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Account deleted successfully')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "to.be.visible" with timeout 5000ms
  - waiting for getByText('Account deleted successfully')

```

```yaml
- heading "Welcome to the Home Page" [level=1]
- button "Sign Up"
- button "Log In"
- button "Delete Account"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect, Page} from "@playwright/test"
  2  | import {signUp, Login , MakeUser} from "./auths"
  3  | test("user can delete their account", async ({ page }) => {
  4  | 
  5  |     await page.goto("/")
  6  |     const user = MakeUser();
  7  |     await signUp(page, user)
  8  |     await Login(page, user)
  9  | 
  10 |     await page.getByRole("button", { name: "Delete Account" }).last().click()
  11 | 
> 12 |     await expect(page.getByText("Account deleted successfully")).toBeVisible()
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  13 | })
  14 | 
```