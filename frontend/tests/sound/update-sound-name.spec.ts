import {test, expect } from "@playwright/test"

import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
  addSound,
} from "../helper/auths"

test("a sound name can be updated", async ({ page }) => {
  await mockBluetooth(page)
  await page.goto("/")

  const user = MakeUser()

  try {
    await signUp(page, user)
    await addDevice(page, "Kitchen SNSA")
    await addSound(page, "Test Sound")

    const soundCard = page.getByRole("button", {
      name: /Test Sound/,
    })

    await expect(soundCard).toBeVisible()
    await soundCard.click()

    await expect(
      page.getByRole("heading", {
        name: "Sound Settings",
      })
    ).toBeVisible()


    await page.getByLabel("New Sound Name").fill("New Sound Name")
    await page.getByRole("button", { name: "Update Sound Name"}).click()

    await expect(page.getByText("Sound Name updated successfully")).toBeVisible()
    await expect(page.getByText("New Sound Name")).toBeVisible()


  } finally {
    await Delete(page, user)
  }
})