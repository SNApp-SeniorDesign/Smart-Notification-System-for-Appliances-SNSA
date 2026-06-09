# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: deleteAccount.spec.ts >> user can delete their account
- Location: tests/deleteAccount.spec.ts:3:0

# Error details

```
ReferenceError: window is not defined
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - heading "Welcome to the Home Page" [level=1] [ref=e3]
  - button "Sign Up" [ref=e4]
  - button "Log In" [ref=e5]
  - button "Delete Account" [active] [ref=e6]
  - region "Notifications alt+T":
    - list
    - list:
      - listitem [ref=e7]:
        - img [ref=e9]
        - generic [ref=e12]: Login successful
      - listitem [ref=e13]:
        - img [ref=e15]
        - generic [ref=e18]: Account created - please log in to continue
  - button "Open Next.js Dev Tools" [ref=e24] [cursor=pointer]:
    - img [ref=e25]
  - alert [ref=e28]
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
  10 |     await page.getByRole("button", { name: "Delete Account" }).first().click()
  11 | 
> 12 |     const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
     |                      ^ ReferenceError: window is not defined
  13 |     
  14 |     page.once("dialog", async (dialog) =>{
  15 |         await dialog.accept()
  16 |     })
  17 | 
  18 |     if(!confirmed) return
  19 |     
  20 |     await expect(
  21 |         page.getByRole("status").filter({
  22 |             hasText: /Account deleted successfully/i,
  23 |         })
  24 |     ).toBeVisible()
  25 | })
  26 | 
```