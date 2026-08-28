import { test, expect } from "@playwright/test"

import {
    MakeUser,
    Delete,
    signUp,
    mockBluetooth,
    addDevice
} from "../helper/auths"

test ("Test if able to change device name", async ( { page }) => {
    await mockBluetooth(page)

    await page.goto("/")

    const user = MakeUser()

    try {
        await signUp(page, user)
        await addDevice(page, "Kitchen SNSA")

        await page.getByRole("button", {
            name: "Toggle details"
        }).click()

        const deviceButton= page.getByRole("button", {
            name: "Kitchen SNSA"
        })

        await deviceButton.hover()
        await page.mouse.down()

        await expect(
            page.getByRole("heading", {
                name: "Device Settings",
                exact: true
            })
        ).toBeVisible()

        await page.mouse.up()

        await page.getByLabel("new_device_name").fill("New Device Name")
        await page.getByRole("button", { name: "Change Device Name"}).click()

        await expect(page.getByText("Device Name updated successfully"))

        await page.pause()

        await page.getByRole("button", {name: "Close"}).click()

        await expect(
            page.getByTestId("selected-device")
        ).toHaveText("New Device Name")

    } finally {
        await Delete(page, user)
    }
})