import {Page, expect } from "@playwright/test"


const IS_PAIRED_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a02"
const SERIAL_NUMBER_UUID = "55a7dc43-48c1-4ad8-bc31-f3d6f08a58a01"

export function MakeUser(){
    const id = Date.now() + Math.floor(Math.random() * 10000);
    return {
        email: `user-${id}@example.com`,
        username: `tester-${id}`,
        password: "12345678"
    }
}


export async function signUp(page: Page, user: ReturnType<typeof MakeUser>){

    await page.getByRole("button", { name: "Sign Up"}).first().click()
    
    await expect(
      page.getByRole("heading", { name: "Create your SNSA Account" })
    ).toBeVisible();

    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Username").fill(user.username)
    await page.getByLabel("Password", { exact: true }).fill(user.password)
    await page.getByLabel("Confirm Password").fill(user.password)

    await page.getByRole("button", {name: "Sign Up"}).click()

    await expect(page.getByText("Account created - welcome")).toBeVisible()

    await expect(page.getByRole("dialog")).not.toBeVisible()

    await expect(page).toHaveURL(/\/dashboard/)
}

export async function Login(page: Page, user: ReturnType<typeof MakeUser>){
    
    await expect(page).toHaveURL(/\/$/)

    await expect(page.getByRole("button", {name:"Log In"})).toBeVisible()
    

    await page.getByRole("button", { name: "Log In"}).click()

    await expect(page.getByRole("dialog")).toBeVisible()
    
    await expect(
      page.getByRole("heading", { name: "Log in to your Account" })
    ).toBeVisible()

    await page.getByLabel("Email").fill(user.email)
    await page.getByLabel("Password").fill(user.password)
    await page.getByRole("button", { name: "Log In" }).click()

    await expect(page).toHaveURL(/dashboard/)
    const token = await page.evaluate(() =>
        localStorage.getItem("access_token"))
    expect(token).not.toBeNull()

}

export async function Delete(page: Page, user: ReturnType<typeof MakeUser>){
    await page.getByRole("link", { name: "Setting"}).click()
    await expect(page).toHaveURL(/\/setting/)

    page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain(
        "Are you sure you want to delete your account?"
        );

        await dialog.accept();
    });

    await page.getByRole("button", { name: "Delete Account" }).click();

    await expect(page).toHaveURL(/\/$/)

    await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("token"))
    }).toBeNull()
}

export async function LogOut(page: Page, user: ReturnType<typeof MakeUser>){
    
    await expect(page).toHaveURL(/dashboard/)
    await page.getByRole("button", { name: "Log-Out"}).first().click()
    
    await expect(page).toHaveURL(/\/$/)
    await expect.poll(async () => {
        return await page.evaluate(() => localStorage.getItem("access_token")) 
    }).toBeNull()

    await expect(page.getByRole("button", {name: "Log-Out"})).not.toBeVisible()
    await expect(page.getByRole("button", { name: "Log In"})).toBeVisible()
}

export async function mockBluetooth(
    page: Page,
    serialNumber = "SNSA-TEST-001",
    isPaired = false
){
    await page.addInitScript(
    ({ pairedUUID, serialUUID, serial, paired }) => {
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

                          if (normalizedUUID === pairedUUID) {
                            return {
                              readValue: async () =>
                                new DataView(
                                  Uint8Array.from([paired ? 1 : 0]).buffer
                                ),
                              writeValue: async () => {},
                            }
                          }

                          if (normalizedUUID === serialUUID) {
                            const bytes = new TextEncoder().encode(serial)

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
    },
    {
      pairedUUID: IS_PAIRED_UUID,
      serialUUID: SERIAL_NUMBER_UUID,
      serial: serialNumber,
      paired: isPaired,
    }
  )
}


export async function addDevice(page: Page, deviceName: string){
    await page.getByRole("button", {
        name: "Toggle details",
    }).click()

    await page.getByRole("button", {
        name: "Add New Device",
    }).click()

    await expect(
        page.getByText("Adding your SNSA device")
    ).toBeVisible()

    await page.getByLabel("Device Name").fill(deviceName)

    await page.getByRole("button", {
        name: "Add Device",
    }).click()

    await expect(
        page.getByText("Device Add Successful")
    ).toBeVisible()

    await expect(
        page.getByTestId("selected-device")
    ).toHaveText(deviceName)
}