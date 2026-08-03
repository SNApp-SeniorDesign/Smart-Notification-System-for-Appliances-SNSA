import { test, expect } from "@playwright/test"
import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
} from "./auths"

test("a sound can be added", async ({ page }) => {
  await mockBluetooth(page)

  await page.goto("/")

  const user = MakeUser()

  try {
    await signUp(page, user)
    await addDevice(page, "Kitchen SNSA")

    await page
      .getByRole("button", { name: "Add Sound" })
      .click()

    await expect(
      page.getByRole("heading", {
        name: "Recording & Save Sound",
      })
    ).toBeVisible()

    await page
      .getByRole("button", { name: "Start Recording" })
      .click()

    await expect(
      page.getByText("Starting...")
    ).toBeVisible()

    await expect(
      page.getByText("Recording...")
    ).toBeVisible()

    await expect(
      page.getByText("Processing...")
    ).toBeVisible()

    await expect(
      page.getByRole("button", { name: "Save Sound" })
    ).toBeVisible()

    await page
      .getByLabel("Sound Name")
      .fill("test sound")

    await page
      .getByRole("button", { name: "Save Sound" })
      .click()

    await expect(
      page.getByText("Saving")
    ).toBeVisible()

    await expect(
      page.getByText("Complete")
    ).toBeVisible()

    await expect(
      page.getByText("Sound Added Successfully")
    ).toBeVisible()

    await expect(
      page.getByText("test sound")
    ).toBeVisible()
  } finally {
    await Delete(page, user)
  }
})