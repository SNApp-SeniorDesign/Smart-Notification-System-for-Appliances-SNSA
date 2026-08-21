import { test, expect } from "@playwright/test"

import {
    MakeUser,
    Delete,
    signUp,
    mockBluetooth,
    addDevice,
    addSound,
} from "./auths"

test ("multiple devices can each have multiple sounds", async ({ page }) => {

    await mockBluetooth(page)
    await page.goto("/")

    const user = MakeUser()

    try {
        await signUp(page, user)

        //Device 1
        await addDevice(page, "Kitchen SNSA")

        await addSound(page, "Microwave Beep")
        await addSound(page, "Oven Timer")

        await expect(
            page.getByText("Microwave Beep")
        ).toBeVisible()

        await page.pause()

        await expect(
            page.getByText("Oven Timer")
        ).toBeVisible()

        await page.pause()

        //Device 2
        await addDevice(page, "Laundry SNSA")

        await addSound(page, "Washer Done")
        await addSound(page, "Dryer Done")

        await expect(
            page.getByText("Washer Done")
        ).toBeVisible()

        await expect(
            page.getByText("Dryer Done")
        ).toBeVisible()

        await page.pause()

        //Kitche sounds should not appeart while Laundry is selected
        await expect(
            page.getByText("Microwave Beep")
        ).not.toBeVisible()

        await expect(
            page.getByText("Oven Timer")
        ).not.toBeVisible()

        await page.pause()
    } finally {
        await Delete(page, user)
    }
})