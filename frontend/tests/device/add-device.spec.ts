import { test, expect } from "@playwright/test"
import { MakeUser, Delete, signUp, mockBluetooth} from "../helper/auths"

test("test if device can be add via bluetooth", async({page}) => {
    //make a fake bluetooth connection
    await mockBluetooth(page)
    
    //real test begin
    await page.goto("/")
    const user = MakeUser();
    try{
      await signUp(page, user);

      await page.getByRole("button", {
          name: "Toggle details",
      }).click()

      await page.getByRole("button", {
          name: "Add New Device",
      }).click()

      await expect(
          page.getByText("Adding your SNSA device")
      ).toBeVisible()

      await page.getByLabel("Device Name").fill("Kitchen SNSA")

      await page.getByRole("button", {
          name: "Add Device",
      }).click()

      await expect(
          page.getByText("Device Add Successful")
      ).toBeVisible()

      await expect(
          page.getByTestId("selected-device")
      ).toHaveText("Kitchen SNSA")
    } finally {
      await Delete(page, user)
    }
})