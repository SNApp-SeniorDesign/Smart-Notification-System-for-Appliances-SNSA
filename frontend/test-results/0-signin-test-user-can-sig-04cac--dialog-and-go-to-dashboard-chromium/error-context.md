# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 0-signin.spec.ts >> test user can sign up, auto-login, close dialog, and go to dashboard
- Location: tests/0-signin.spec.ts:4:0

# Error details

```
Error: click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('link', { name: 'Setting' })

```

# Test source

```ts
  1   | import {Page, expect } from "@playwright/test"
  2   | 
  3   | 
  4   | const IS_PAIRED_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a02"
  5   | const SERIAL_NUMBER_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a01"
  6   | 
  7   | export function MakeUser(){
  8   |     const id = Date.now() + Math.floor(Math.random() * 10000);
  9   |     return {
  10  |         email: `user-${id}@example.com`,
  11  |         username: `tester-${id}`,
  12  |         password: "12345678"
  13  |     }
  14  | }
  15  | 
  16  | 
  17  | export async function signUp(page: Page, user: ReturnType<typeof MakeUser>){
  18  | 
  19  |     await page.getByRole("button", { name: "Sign Up"}).first().click()
  20  |     
  21  |     await expect(
  22  |       page.getByRole("heading", { name: "Create your SNSA Account" })
  23  |     ).toBeVisible();
  24  | 
  25  |     await page.getByLabel("Email").fill(user.email)
  26  |     await page.getByLabel("Username").fill(user.username)
  27  |     await page.getByLabel("Password", { exact: true }).fill(user.password)
  28  |     await page.getByLabel("Confirm Password").fill(user.password)
  29  | 
  30  |     await page.getByRole("button", {name: "Sign Up"}).click()
  31  | 
  32  |     await expect(page.getByText("Account created - welcome")).toBeVisible()
  33  | 
  34  |     await expect(page.getByRole("dialog")).not.toBeVisible()
  35  | 
  36  |     await expect(page).toHaveURL(/\/dashboard/)
  37  | }
  38  | 
  39  | export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
  40  |     
  41  |     await expect(page).toHaveURL(/\/$/)
  42  | 
  43  |     await expect(page.getByRole("button", {name:"Log In"})).toBeVisible()
  44  |     
  45  | 
  46  |     await page.getByRole("button", { name: "Log In"}).click()
  47  | 
  48  |     await expect(page.getByRole("dialog")).toBeVisible()
  49  |     
  50  |     await expect(
  51  |       page.getByRole("heading", { name: "Log in to your Account" })
  52  |     ).toBeVisible()
  53  | 
  54  |     await page.getByLabel("Email").fill(user.email)
  55  |     await page.getByLabel("Password").fill(user.password)
  56  |     await page.getByRole("button", { name: "Log In" }).click()
  57  | 
  58  |     await expect(page).toHaveURL(/dashboard/)
  59  |     const token = await page.evaluate(() =>
  60  |         localStorage.getItem("access_token"))
  61  |     expect(token).not.toBeNull()
  62  | 
  63  | }
  64  | 
  65  | export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
> 66  |     await page.getByRole("link", { name: "Setting"}).click()
      |                                                     ^ Error: click: Target page, context or browser has been closed
  67  |     await expect(page).toHaveURL(/\/setting/)
  68  | 
  69  |     page.once("dialog", async (dialog) => {
  70  |         expect(dialog.message()).toContain(
  71  |         "Are you sure you want to delete your account?"
  72  |         );
  73  | 
  74  |         await dialog.accept();
  75  |     });
  76  | 
  77  |     await page.getByRole("button", { name: "Delete Account" }).click();
  78  | 
  79  |     await expect(page).toHaveURL(/\/$/)
  80  | 
  81  |     await expect.poll(async () => {
  82  |         return await page.evaluate(() => localStorage.getItem("token"))
  83  |     }).toBeNull()
  84  | }
  85  | 
  86  | export async function LogOut(page: Page, user: ReturnType<typeof MakeUser>){
  87  |     
  88  |     await expect(page).toHaveURL(/dashboard/)
  89  |     await page.getByRole("button", { name: "Log-Out"}).first().click()
  90  |     
  91  |     await expect(page).toHaveURL(/\/$/)
  92  |     await expect.poll(async () => {
  93  |         return await page.evaluate(() => localStorage.getItem("access_token")) 
  94  |     }).toBeNull()
  95  | 
  96  |     await expect(page.getByRole("button", {name: "Log-Out"})).not.toBeVisible()
  97  |     await expect(page.getByRole("button", { name: "Log In"})).toBeVisible()
  98  | }
  99  | 
  100 | export async function mockBluetooth(
  101 |     page: Page,
  102 |     serialNumber = "SNSA-TEST-001",
  103 |     isPaired = false
  104 | ){
  105 |     await page.addInitScript(
  106 |     ({ pairedUUID, serialUUID, serial, paired }) => {
  107 |       Object.defineProperty(navigator, "bluetooth", {
  108 |         configurable: true,
  109 |         value: {
  110 |           requestDevice: async () => {
  111 |             return {
  112 |               gatt: {
  113 |                 connect: async () => {
  114 |                   return {
  115 |                     getPrimaryService: async () => {
  116 |                       return {
  117 |                         getCharacteristic: async (uuid: string) => {
  118 |                           const normalizedUUID = uuid.toLowerCase()
  119 | 
  120 |                           if (normalizedUUID === pairedUUID) {
  121 |                             return {
  122 |                               readValue: async () =>
  123 |                                 new DataView(
  124 |                                   Uint8Array.from([paired ? 1 : 0]).buffer
  125 |                                 ),
  126 |                               writeValue: async () => {},
  127 |                             }
  128 |                           }
  129 | 
  130 |                           if (normalizedUUID === serialUUID) {
  131 |                             const bytes = new TextEncoder().encode(serial)
  132 | 
  133 |                             return {
  134 |                               readValue: async () =>
  135 |                                 new DataView(bytes.buffer),
  136 |                               writeValue: async () => {},
  137 |                             }
  138 |                           }
  139 | 
  140 |                           throw new Error(
  141 |                             `Unknown characteristic: ${uuid}`
  142 |                           )
  143 |                         },
  144 |                       }
  145 |                     },
  146 |                   }
  147 |                 },
  148 | 
  149 |                 disconnect: () => {},
  150 |               },
  151 |             }
  152 |           },
  153 |         },
  154 |       })
  155 |     },
  156 |     {
  157 |       pairedUUID: IS_PAIRED_UUID,
  158 |       serialUUID: SERIAL_NUMBER_UUID,
  159 |       serial: serialNumber,
  160 |       paired: isPaired,
  161 |     }
  162 |   )
  163 | }
  164 | 
  165 | 
  166 | export async function addDevice(page: Page, deviceName: string){
```