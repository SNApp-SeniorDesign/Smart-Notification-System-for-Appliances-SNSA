# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sound/update-sound-name.spec.ts >> a sound name can be updated
- Location: tests/sound/update-sound-name.spec.ts:12:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('New Sound Name')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('New Sound Name')

```

```yaml
- banner:
  - link "Go to landing page":
    - /url: /
    - text: Home
  - navigation "Primary":
    - link "Dashboard":
      - /url: /dashboard
  - button "Log-Out"
- main:
  - text: Kitchen SNSA
  - button "Toggle details"
  - 'button "Test Sound Status: monitoring Enable: Yes Device sync: Not synced"':
    - text: Test Sound
    - paragraph: "Status: monitoring"
    - paragraph: "Enable: Yes"
    - paragraph: "Device sync: Not synced"
- contentinfo:
  - link "Home":
    - /url: /dashboard
  - link "Setting":
    - /url: /setting
  - button "Add Sound"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import {test, expect } from "@playwright/test"
  2  | 
  3  | import {
  4  |   MakeUser,
  5  |   Delete,
  6  |   signUp,
  7  |   mockBluetooth,
  8  |   addDevice,
  9  |   addSound,
  10 | } from "../helper/auths"
  11 | 
  12 | test("a sound name can be updated", async ({ page }) => {
  13 |   await mockBluetooth(page)
  14 |   await page.goto("/")
  15 | 
  16 |   const user = MakeUser()
  17 | 
  18 |   try {
  19 |     await signUp(page, user)
  20 |     await addDevice(page, "Kitchen SNSA")
  21 |     await addSound(page, "Test Sound")
  22 | 
  23 |     const soundCard = page.getByRole("button", {
  24 |       name: /Test Sound/,
  25 |     })
  26 | 
  27 |     await expect(soundCard).toBeVisible()
  28 |     await soundCard.click()
  29 | 
  30 |     await expect(
  31 |       page.getByRole("heading", {
  32 |         name: "Sound Settings",
  33 |       })
  34 |     ).toBeVisible()
  35 | 
  36 | 
  37 |     await page.pause()
  38 | 
  39 |     await page.getByLabel("New Sound Name").fill("New Sound Name")
  40 |     await page.getByRole("button", { name: "Update Sound Name"}).click()
  41 | 
  42 |     await expect(page.getByText("Sound Name updated successfully")).toBeVisible()
  43 | 
  44 |     await page.pause()
> 45 |     await expect(page.getByText("New Sound Name")).toBeVisible()
     |                                                    ^ Error: expect(locator).toBeVisible() failed
  46 | 
  47 |     await page.pause()
  48 | 
  49 |   } finally {
  50 |     await Delete(page, user)
  51 |   }
  52 | })
```