import { test, expect } from "@playwright/test"
import {
    MakeUser, 
    Delete, 
    signUp, 
    mockBluetooth, 
    addDevice
} from "./auths"

test("test if a sound can be add", async ( { page }) => {
    await mockBluetooth(page)

    await page.goto("/")

    const user = MakeUser()
    try { 
        await signUp(page, user)
        await addDevice(page, "Kitchen SNSA")

        await page.getByRole("button", {
            name: "Add Sound"
        }).click()

        await expect (page.getByRole("heading", {name: "Recording & Save Sound"})
        ).toBeVisible()

        await page.getByRole("button", {
            name: "Start Recording"
        }).click()

        await expect (page.getByText("Starting..."))
        await expect (page.getByText("Recording..."))
        await expect (page.getByText("Processing..."))
        await expect (page.getByText("Save Sound"))

        await page.getByLabel("Sound Name").fill("test sound")

        await expect (page.getByText("Saving"))
        await expect (page.getByText("Complete"))

        await expect(page.getByText("Sound Added Successfully"))
        await page.getByLabel("test sound")

    } finally{
        Delete(page, user)
    }
})