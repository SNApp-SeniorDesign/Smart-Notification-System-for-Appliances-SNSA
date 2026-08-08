import {test, expect } from "@playwright/test"

import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
  addSound,
} from "./auths"

test("a sound can be deleted", async ({ page }) => {
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

    await page
      .getByRole("button", {
        name: "Delete Sound",
      })
      .click()

    await expect(
      page.getByRole("heading", {
        name: "Delete this sound?",
      })
    ).toBeVisible()

    await expect(
      page.getByText(
        /permanently delete “Test Sound”/
      )
    ).toBeVisible()

    const deleteResponsePromise =
      page.waitForResponse((response) => {
        const url = new URL(response.url())

        return (
          response.request().method() === "DELETE" &&
          url.pathname.includes("/sound/") &&
          url.pathname.endsWith("/delete")
        )
      })

    await page
      .getByRole("button", {
        name: "Delete",
        exact: true,
      })
      .click()

    const deleteResponse = await deleteResponsePromise

    expect(deleteResponse.ok()).toBeTruthy()

    await expect(
      page.getByText("Sound deleted successfully")
    ).toBeVisible()

    await expect(soundCard).not.toBeVisible()
  } finally {
    await Delete(page, user)
  }
})