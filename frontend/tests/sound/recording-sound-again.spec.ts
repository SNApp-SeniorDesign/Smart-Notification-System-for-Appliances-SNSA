import {test, expect } from "@playwright/test"

import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
  addSound,
} from "../helper/auths"

test("a sound can be recorded again", async ({ page }) => {
  await mockBluetooth(page)
  await page.goto("/")

  const user = MakeUser()

  try {
    await signUp(page, user)
    await addDevice(page, "Kitchen SNSA")
    const originalSound = await addSound(page, "Test Sound")

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

    await page.pause()

    await page.getByRole("button", { name: "Record Sound Again"}).click()

    await page
      .getByRole("button", { name: "Start Recording" })
      .click()

    await expect(page.getByText("Starting...")).toBeVisible()
    await expect(page.getByText("Recording...")).toBeVisible()
    await expect(page.getByText("Processing...")).toBeVisible()

    await page.pause()

    await expect(
        page.getByRole("button", { name: "Save Sound" })
    ).toBeVisible()

    const updateResponsePromise =
        page.waitForResponse((response) => {
            const url = new URL(response.url())

            return (
            response.request().method() === "PUT" &&
            url.pathname.includes("/sound/") &&
            url.pathname.includes("/update")
            )
        })

    await page
        .getByRole("button", { name: "Save Sound" })
        .click()

    await expect(page.getByText("Saving...")).toBeVisible()
    await expect(page.getByText("Complete")).toBeVisible()
    
    const updateResponse = await updateResponsePromise

    expect(updateResponse.ok()).toBeTruthy()

    const updatedSound = await updateResponse.json()

    await expect(page.getByText("Sound file updated successfully")).toBeVisible()
    

    const soundSettingsDialog = page
    .getByRole("dialog")
    .filter({
        has: page.getByRole("heading", {
        name: "Sound Settings",
        }),
    })

    await soundSettingsDialog
    .getByRole("button", { name: "Close" })
    .click()

    await page.pause()

    expect(updatedSound.id).toBe(originalSound.id)
    
    expect(updatedSound.sound_file_key)
    .not.toBe(originalSound.sound_file_key)

    expect(updatedSound.profile_version)
    .toBe(originalSound.profile_version + 1)

  } finally {
    await Delete(page, user)
  }
})