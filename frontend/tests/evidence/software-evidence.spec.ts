import {
  test,
  expect,
  type Page,
} from "@playwright/test"

import {
  MakeUser,
  Delete,
  mockBluetooth,
} from "../helper/auths"


async function hidePlaywrightIndicators(page: Page) {
  await page.screencast.hideActions()
  await page.screencast.hideOverlays()

  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur()
  })
}


async function waitForEvidence(
  page: Page,
  message: string
) {
  console.log(message)

  // Gives you time to take screenshots manually.
  // Increase 60_000 if necessary.
  await page.waitForTimeout(30_000)
}


test("software workflow evidence", async ({ page }) => {
  test.setTimeout(0)

  const user = MakeUser()
  const deviceName = "Kitchen SNSA"
  const soundName = "R2 test sound"

  try {
    await mockBluetooth(page)
    await page.goto("/")


    // ----------------------------------------
    // User Registration
    // ----------------------------------------

    await waitForEvidence(
      page,
      "Take a screenshot of the landing page."
    )

    await page
      .getByRole("button", { name: "Sign Up" })
      .first()
      .click()

    const signUpDialog = page.getByRole("dialog")

    await expect(signUpDialog).toBeVisible()

    await hidePlaywrightIndicators(page)

    await signUpDialog
      .getByLabel("Email")
      .fill(user.email)

    await signUpDialog
      .getByLabel("Username")
      .fill(user.username)

    await signUpDialog
      .getByLabel("Password", { exact: true })
      .fill(user.password)

    await signUpDialog
      .getByLabel("Confirm Password")
      .fill(user.password)
    
    await waitForEvidence(
      page,
      "Take a screenshot of the user registration form."
    )

    await signUpDialog
      .getByRole("button", { name: "Sign Up" })
      .click()

    await expect(
      page.getByText("Account created - welcome")
    ).toBeVisible()

    await expect(page).toHaveURL(/dashboard/)

    await hidePlaywrightIndicators(page)

    await waitForEvidence(
      page,
      "Take a screenshot of the dashboard and the new user record in Neon."
    )


    // ----------------------------------------
    // Device Registration
    // ----------------------------------------

    await page
      .getByRole("button", { name: "Toggle details" })
      .click()

    await page
      .getByRole("button", { name: "Add New Device" })
      .click()

    const deviceDialog = page.getByRole("dialog")

    await waitForEvidence(
      page,
      "Take a screenshot of the empty device menu."
    )

    await expect(
      page.getByText("Adding your SNSA device")
    ).toBeVisible()

    await deviceDialog
      .getByLabel("Device Name")
      .fill(deviceName)

    await hidePlaywrightIndicators(page)

    await waitForEvidence(
      page,
      "Take a screenshot of the device registration form."
    )

    await deviceDialog
      .getByRole("button", { name: "Add Device" })
      .click()

    await expect(
      page.getByText("Device Add Successful")
    ).toBeVisible()

    await expect(
      page.getByTestId("selected-device")
    ).toHaveText(deviceName)

    await hidePlaywrightIndicators(page)

    await waitForEvidence(
      page,
      "Take a screenshot of the registered device and device record in Neon."
    )


    // ----------------------------------------
    // Sound Registration
    // ----------------------------------------

    await page
      .getByRole("button", { name: "Add Sound" })
      .click()

    const soundDialog = page.getByRole("dialog")

    await expect(
      soundDialog.getByRole("heading", {
        name: "Record and Save your Sound",
      })
    ).toBeVisible()

    await soundDialog
      .getByRole("button", { name: "Start Recording" })
      .click()

    await expect(
      soundDialog.getByRole("button", { name: "Save Sound" })
    ).toBeVisible()

    await soundDialog
      .getByLabel("Sound Name")
      .fill(soundName)

    await hidePlaywrightIndicators(page)

    await waitForEvidence(
      page,
      "Take a screenshot of the completed sound-recording form."
    )

    const createResponsePromise =
      page.waitForResponse((response) => {
        const url = new URL(response.url())

        return (
          response.request().method() === "POST" &&
          url.pathname.includes("/sound/")
        )
      })

    await soundDialog
      .getByRole("button", { name: "Save Sound" })
      .click()

    const createResponse = await createResponsePromise

    expect(createResponse.ok()).toBeTruthy()

    await expect(
      page.getByText("Sound Added Successfully")
    ).toBeVisible()

    await expect(
      page.getByText(soundName)
    ).toBeVisible()

    await hidePlaywrightIndicators(page)

    await waitForEvidence(
      page,
      "Take a screenshot of the registered sound and the Cloudflare R2 object."
    )
  } finally {
    await Delete(page, user)
  }
})