import { test, expect } from "@playwright/test"
import { MakeUser, Delete, signUp} from "./auths"

test("test if device can be add via bluetooth", async({page}) => {
    //make a fake bluetooth connection
    await page.addInitScript(() => {
  const IS_PAIRED_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a02"
  const SERIAL_NUMBER_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a01"

  Object.defineProperty(navigator, "bluetooth", {
    configurable: true,
    value: {
      requestDevice: async () => {
        return {
          gatt: {
            connect: async () => {
              return {
                getPrimaryService: async () => {
                  return {
                    getCharacteristic: async (uuid: string) => {
                      const normalizedUUID = uuid.toLowerCase()

                      if (normalizedUUID === IS_PAIRED_UUID) {
                        return {
                          readValue: async () =>
                            new DataView(Uint8Array.from([0]).buffer),

                          writeValue: async () => {},
                        }
                      }

                      if (normalizedUUID === SERIAL_NUMBER_UUID) {
                        const bytes = new TextEncoder().encode(
                          "SNSA-TEST-001"
                        )

                        return {
                          readValue: async () =>
                            new DataView(bytes.buffer),

                          writeValue: async () => {},
                        }
                      }

                      throw new Error(
                        `Unknown characteristic: ${uuid}`
                      )
                    },
                  }
                },
              }
            },

            disconnect: () => {},
          },
        }
      },
    },
  })
})
    
    //real test begin
    await page.goto("/")
    const user = MakeUser();

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

    await Delete(page, user)
})