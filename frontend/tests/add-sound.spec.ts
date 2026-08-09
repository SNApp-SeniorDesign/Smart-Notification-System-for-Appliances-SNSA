import { test, expect } from "@playwright/test"
import {
  MakeUser,
  Delete,
  signUp,
  mockBluetooth,
  addDevice,
} from "./auths"

test("a sound can be added using production storage", async ({ page }) => {
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
        name: "Record and Save your Sound",
      })
    ).toBeVisible()

    await page
      .getByRole("button", { name: "Start Recording" })
      .click()

    await expect(page.getByText("Starting...")).toBeVisible()
    await expect(page.getByText("Recording...")).toBeVisible()
    await expect(page.getByText("Processing...")).toBeVisible()

    await expect(
      page.getByRole("button", { name: "Save Sound" })
    ).toBeVisible()

    await page
      .getByLabel("Sound Name")
      .fill("R2 test sound")

    const createResponsePromise =
      page.waitForResponse((response) => {
        const url = new URL(response.url())

        return (
          response.request().method() === "POST" &&
          url.pathname.includes("/sound/")
        )
      })

    await page
      .getByRole("button", { name: "Save Sound" })
      .click()


    await expect(page.getByText("Saving")).toBeVisible()
    await expect(page.getByText("Complete")).toBeVisible()

    await expect(
      page.getByText("Sound Added Successfully")
    ).toBeVisible()

    const createResponse = await createResponsePromise

    expect(createResponse.ok()).toBeTruthy()

    await expect(
      page.getByText("R2 test sound")
    ).toBeVisible()
  } finally {
    await Delete(page, user)
  }
})