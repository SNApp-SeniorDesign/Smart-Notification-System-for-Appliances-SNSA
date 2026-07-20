# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: add-device.spec.ts >> test if device can be add via bluetooth
- Location: tests/add-device.spec.ts:4:0

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Device Add Successful')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "to.be.visible" with timeout 5000ms
  - waiting for getByText('Device Add Successful')

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
  - button "Toggle details" [expanded]
  - button "Kitchen SNSA"
  - button "Add New Device"
- contentinfo:
  - link "Home":
    - /url: /dashboard
  - link "Setting":
    - /url: /setting
- banner:
  - link "Go to landing page":
    - /url: /
    - text: Home
  - navigation "Primary":
    - link "Dashboard":
      - /url: /dashboard
  - button "Log-Out"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | import { MakeUser, Delete, signUp} from "./auths"
  3  | 
  4  | test("test if device can be add via bluetooth", async({page}) => {
  5  |     //make a fake bluetooth connection
  6  |     await page.addInitScript(() => {
  7  |   const IS_PAIRED_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a02"
  8  |   const SERIAL_NUMBER_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a01"
  9  | 
  10 |   Object.defineProperty(navigator, "bluetooth", {
  11 |     configurable: true,
  12 |     value: {
  13 |       requestDevice: async () => {
  14 |         return {
  15 |           gatt: {
  16 |             connect: async () => {
  17 |               return {
  18 |                 getPrimaryService: async () => {
  19 |                   return {
  20 |                     getCharacteristic: async (uuid: string) => {
  21 |                       const normalizedUUID = uuid.toLowerCase()
  22 | 
  23 |                       if (normalizedUUID === IS_PAIRED_UUID) {
  24 |                         return {
  25 |                           readValue: async () =>
  26 |                             new DataView(Uint8Array.from([0]).buffer),
  27 | 
  28 |                           writeValue: async () => {},
  29 |                         }
  30 |                       }
  31 | 
  32 |                       if (normalizedUUID === SERIAL_NUMBER_UUID) {
  33 |                         const bytes = new TextEncoder().encode(
  34 |                           "SNSA-TEST-001"
  35 |                         )
  36 | 
  37 |                         return {
  38 |                           readValue: async () =>
  39 |                             new DataView(bytes.buffer),
  40 | 
  41 |                           writeValue: async () => {},
  42 |                         }
  43 |                       }
  44 | 
  45 |                       throw new Error(
  46 |                         `Unknown characteristic: ${uuid}`
  47 |                       )
  48 |                     },
  49 |                   }
  50 |                 },
  51 |               }
  52 |             },
  53 | 
  54 |             disconnect: () => {},
  55 |           },
  56 |         }
  57 |       },
  58 |     },
  59 |   })
  60 | })
  61 |     
  62 |     //real test begin
  63 |     await page.goto("/")
  64 |     const user = MakeUser();
  65 | 
  66 |     await signUp(page, user);
  67 | 
  68 | 
  69 |     await page.getByRole("button", {
  70 |         name: "Toggle details",
  71 |     }).click()
  72 | 
  73 |     await page.getByRole("button", {
  74 |         name: "Add New Device",
  75 |     }).click()
  76 | 
  77 |     await expect(
  78 |         page.getByText("Adding your SNSA device")
  79 |     ).toBeVisible()
  80 | 
  81 |     await page.getByLabel("Device Name").fill("Kitchen SNSA")
  82 | 
  83 |     await page.getByRole("button", {
  84 |         name: "Add Device",
  85 |     }).click()
  86 | 
  87 |     await expect(
  88 |         page.getByText("Device Add Successful")
> 89 |     ).toBeVisible()
     |      ^ Error: expect(locator).toBeVisible() failed
  90 | 
  91 |     await expect(
  92 |         page.getByTestId("selected-device")
  93 |     ).toHaveText("Kitchen SNSA")
  94 | 
  95 |     await Delete(page, user)
  96 | })
```