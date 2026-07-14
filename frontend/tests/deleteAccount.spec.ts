import { test, expect } from "@playwright/test";
import { MakeUser, signUp} from "./auths";

test("user can delete their account", async ({ page }) => {
  
    await page.goto("/")
    const user = MakeUser();

    await signUp(page, user);

    
    await page.getByRole("link", { name: "Setting"}).click()
    await expect(page).toHaveURL(/\/setting/)

    page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain(
        "Are you sure you want to delete your account?"
        );

        await dialog.accept();
    });

    await page.getByRole("button", { name: "Delete Account" }).click();

    await expect(
        page.getByText(/Account deleted successfully/i)
    ).toBeVisible();

    await expect(page).toHaveURL(/\/$/)

    await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("token"))
    }).toBeNull()
});