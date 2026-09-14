import { test, expect } from "@playwright/test"
import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
} from "../helper/auths"

test("a sound file can be uploaded using production storage", async ({
  page,
}) => {
  await mockBluetooth(page)

  await page.goto("/")

  const user = MakeUser()

  try {
    await signUp(page, user)
    await addDevice(page, "Kitchen SNSA")

    await page
      .getByRole("button", { name: /add sound/i })
      .click()

    await expect(
      page.getByRole("heading", {
        name: "Record and Save your Sound",
      })
    ).toBeVisible()

    const soundFileInput =
      page.getByLabel("Or upload a sound file")

    await expect(soundFileInput).toBeVisible()

    await soundFileInput.setInputFiles(
      "tests/fixtures/test-sound.mp3"
    )

    // Selecting a file should move the form to naming.
    await expect(
      page.getByLabel("Sound Name")
    ).toBeVisible()

    await expect(
      page.getByRole("button", {
        name: "Save Sound",
      })
    ).toBeVisible()

    await page
      .getByLabel("Sound Name")
      .fill("R2 uploaded sound")

    const createResponsePromise =
      page.waitForResponse((response) => {
        const url = new URL(response.url())

        return (
          response.request().method() === "POST" &&
          url.pathname.endsWith("/sound/register")
        )
      })

    await page
      .getByRole("button", {
        name: "Save Sound",
      })
      .click()

    await expect(
      page.getByRole("button", {
        name: "Saving...",
      })
    ).toBeVisible()

    const createResponse =
      await createResponsePromise

    expect(createResponse.ok()).toBeTruthy()

    await expect(
      page.getByText("Sound added successfully")
    ).toBeVisible()

    await expect(
      page.getByText("R2 uploaded sound")
    ).toBeVisible()
  } finally {
    await Delete(page, user)
  }
})