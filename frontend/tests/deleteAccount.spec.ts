import { test, expect, Page} from "@playwright/test"
import {signUp, Login , MakeUser} from "./auths"
test("user can delete their account", async ({ page }) => {

    await page.goto("/")
    const user = MakeUser();
    await signUp(page, user)
    await Login(page, user)

    await page.getByRole("button", { name: "Delete Account" }).first().click()

    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
    
    page.once("dialog", async (dialog) =>{
        await dialog.accept()
    })

    if(!confirmed) return
    
    await expect(
        page.getByRole("status").filter({
            hasText: /Account deleted successfully/i,
        })
    ).toBeVisible()
})
