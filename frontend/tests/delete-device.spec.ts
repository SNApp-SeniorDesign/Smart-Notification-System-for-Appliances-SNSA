import { test, expect } from "@playwright/test"
import {
    MakeUser, 
    Delete, 
    signUp, 
    mockBluetooth, 
    addDevice
} from "./auths"

test("test if device can be delete", async ( { page }) => {
    await mockBluetooth(page)

    await page.goto("/")

    const user = MakeUser()
    try { 
        await signUp(page, user)
        await addDevice(page, "Kitchen SNSA")

        await page.getByRole("button", {
            name: "Toggle details"
        }).click()

        const deviceButton = page.getByRole("button", {
            name: "Kitchen SNSA"
        })

        await deviceButton.hover()
        await page.mouse.down()

        await expect(
            page.getByRole("heading", {
                name: "Device Settings",
                exact: true
            })
        ).toBeVisible({ timeout: 3000})

        await page.mouse.up()

        const settingsDialog = page.getByRole("dialog").filter({
            hasText : "Device Settings"
        })

        await page.pause()

        await expect(settingsDialog).toBeVisible()

        await settingsDialog.getByRole("button", {
            name: "Delete Device",
            exact: true,
        }).click()

        const deleteDialog = page.getByRole("alertdialog")

        await expect(
            deleteDialog.getByText("Are you absolutely sure?")
        ).toBeVisible()

        await deleteDialog.getByRole("button", {
            name: "Delete Device",
            exact: true,
        }).click()

        await expect(
            page.getByText("Device deleted successfully")
        ).toBeVisible()

        await expect(
            page.getByTestId("selected-device")
        ).toHaveText("Device Name")

        await page.getByRole("button", {
            name: "Toggle details"
        }).click()

        await expect(
            page.getByRole("button", {
                name: "Kitchen SNSA",
                exact: true,
            })
        ).toHaveCount(0)
    } finally {
        await Delete(page, user)
    }

})