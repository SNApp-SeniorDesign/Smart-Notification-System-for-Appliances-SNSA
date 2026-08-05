import {test, expect } from "@playwright/test"

import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
  addSound,
} from "./auths"

test("a sound can be delete", async ({ page }) => {
  await mockBluetooth(page)

  await page.goto("/")

  const user = MakeUser()

  try {
    await signUp(page, user)
    await addDevice(page, "Kitchen SNSA")
    await addSound(page, "Test Sound")
  } finally {
    await Delete(page, user)
  }
})