import {Page, expect } from "@playwright/test"

import {
  IS_PAIRED_UUID,
  RECORD_COMMAND_UUID,
  RECORDING_RESULT_UUID,
  RECORDING_STATUS_UUID,
  SERIAL_NUMBER_UUID,
  SNSA_SERVICE_UUID,
} from "@/lib/bluetooth"

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
): Promise<void> {
  await page.addInitScript(
    ({
      serviceUUID,
      pairedUUID,
      serialUUID,
      recordCommandUUID,
      recordingStatusUUID,
      recordingResultUUID,
      serial,
      paired,
    }) => {
      const normalize = (uuid: string) => uuid.toLowerCase()

      const createWavBytes = (): Uint8Array => {
        // Minimal valid WAV header with no audio data.
        const buffer = new ArrayBuffer(44)
        const view = new DataView(buffer)
        const encoder = new TextEncoder()

        const writeString = (
          offset: number,
          value: string
        ): void => {
          const bytes = encoder.encode(value)

          for (let index = 0; index < bytes.length; index++) {
            view.setUint8(offset + index, bytes[index])
          }
        }

        writeString(0, "RIFF")
        view.setUint32(4, 36, true)
        writeString(8, "WAVE")
        writeString(12, "fmt ")
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, 1, true)
        view.setUint32(24, 16000, true)
        view.setUint32(28, 32000, true)
        view.setUint16(32, 2, true)
        view.setUint16(34, 16, true)
        writeString(36, "data")
        view.setUint32(40, 0, true)

        return new Uint8Array(buffer)
      }

      class MockCharacteristic extends EventTarget {
        value: DataView | null = null
        isNotifying = false

        constructor(
          private readonly readValueFactory:
            () => Promise<DataView>,
          private readonly onWrite?: (
            value: BufferSource
          ) => Promise<void>
        ) {
          super()
        }

        async readValue(): Promise<DataView> {
          this.value = await this.readValueFactory()
          return this.value
        }

        async writeValueWithResponse(
          value: BufferSource
        ): Promise<void> {
          await this.onWrite?.(value)
        }

        async writeValue(
          value: BufferSource
        ): Promise<void> {
          await this.onWrite?.(value)
        }

        async startNotifications(): Promise<this> {
          this.isNotifying = true
          return this
        }

        async stopNotifications(): Promise<this> {
          this.isNotifying = false
          return this
        }

        emitValue(bytes: Uint8Array): void {
          this.value = new DataView(
            bytes.buffer,
            bytes.byteOffset,
            bytes.byteLength
          )

          this.dispatchEvent(
            new Event("characteristicvaluechanged")
          )
        }
      }

      const statusCharacteristic = new MockCharacteristic(
        async () =>
          new DataView(Uint8Array.from([0]).buffer)
      )

      const characteristics = new Map<
        string,
        MockCharacteristic
      >()

      characteristics.set(
        normalize(serialUUID),
        new MockCharacteristic(async () => {
          const bytes = new TextEncoder().encode(serial)

          return new DataView(
            bytes.buffer,
            bytes.byteOffset,
            bytes.byteLength
          )
        })
      )

      characteristics.set(
        normalize(pairedUUID),
        new MockCharacteristic(async () => {
          return new DataView(
            Uint8Array.from([paired ? 1 : 0]).buffer
          )
        })
      )

      characteristics.set(
        normalize(recordingStatusUUID),
        statusCharacteristic
      )

      characteristics.set(
        normalize(recordingResultUUID),
        new MockCharacteristic(async () => {
          const bytes = createWavBytes()

          return new DataView(
            bytes.buffer,
            bytes.byteOffset,
            bytes.byteLength
          )
        })
      )

      characteristics.set(
        normalize(recordCommandUUID),
        new MockCharacteristic(
          async () => new DataView(new ArrayBuffer(0)),
          async () => {
            // Give the app time to update each UI state.
            setTimeout(() => {
              statusCharacteristic.emitValue(
                Uint8Array.from([1])
              )
            }, 50)

            setTimeout(() => {
              statusCharacteristic.emitValue(
                Uint8Array.from([2])
              )
            }, 150)

            setTimeout(() => {
              statusCharacteristic.emitValue(
                Uint8Array.from([3])
              )
            }, 250)
          }
        )
      )

      const service = {
        uuid: serviceUUID,

        getCharacteristic: async (uuid: string) => {
          const characteristic = characteristics.get(
            normalize(uuid)
          )

          if (!characteristic) {
            throw new Error(
              `Unknown characteristic: ${uuid}`
            )
          }

          return characteristic
        },
      }

      class MockBluetoothDevice extends EventTarget {
        readonly id = "mock-snsa-device"
        readonly name = "Mock SNSA Device"

        readonly gatt = {
          connected: false,

          connect: async () => {
            this.gatt.connected = true
            return this.gatt
          },

          disconnect: () => {
            if (!this.gatt.connected) {
              return
            }

            this.gatt.connected = false

            this.dispatchEvent(
              new Event("gattserverdisconnected")
            )
          },

          getPrimaryService: async (uuid: string) => {
            if (normalize(uuid) !== normalize(serviceUUID)) {
              throw new Error(
                `Unknown service: ${uuid}`
              )
            }

            return service
          },
        }
      }

      const device = new MockBluetoothDevice()

      Object.defineProperty(navigator, "bluetooth", {
        configurable: true,
        value: {
          requestDevice: async () => device,
          getDevices: async () => [device],
        },
      })
    },
    {
      serviceUUID: SNSA_SERVICE_UUID,
      pairedUUID: IS_PAIRED_UUID,
      serialUUID: SERIAL_NUMBER_UUID,
      recordCommandUUID: RECORD_COMMAND_UUID,
      recordingStatusUUID: RECORDING_STATUS_UUID,
      recordingResultUUID: RECORDING_RESULT_UUID,
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