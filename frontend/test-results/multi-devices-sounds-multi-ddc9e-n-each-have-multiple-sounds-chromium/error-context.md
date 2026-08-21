# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: multi-devices-sounds.spec.ts >> multiple devices can each have multiple sounds
- Location: tests/multi-devices-sounds.spec.ts:12:0

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Device Add Successful')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "to.be.visible" with timeout 10000ms
  - waiting for getByText('Device Add Successful')

```

```yaml
- banner:
  - link "Go to landing page":
    - /url: /
    - text: Home
  - navigation "Primary":
    - link "Dashboard":
      - /url: /dashboard
  - button "Log-Out"
- main:
  - text: Kitchen SNSA
  - button "Toggle details" [expanded]
  - button "Kitchen SNSA"
  - button "Add New Device"
  - 'button "Microwave Beep Status: monitoring Enable: Yes Device sync: Not synced"':
    - text: Microwave Beep
    - paragraph: "Status: monitoring"
    - paragraph: "Enable: Yes"
    - paragraph: "Device sync: Not synced"
  - 'button "Oven Timer Status: monitoring Enable: Yes Device sync: Not synced"':
    - text: Oven Timer
    - paragraph: "Status: monitoring"
    - paragraph: "Enable: Yes"
    - paragraph: "Device sync: Not synced"
- contentinfo:
  - link "Home":
    - /url: /dashboard
  - link "Setting":
    - /url: /setting
  - button "Add Sound"
- banner:
  - link "Go to landing page":
    - /url: /
    - text: Home
  - navigation "Primary":
    - link "Dashboard":
      - /url: /dashboard
  - button "Log-Out"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  309 | 
  310 |       const service = {
  311 |         uuid: serviceUUID,
  312 | 
  313 |         getCharacteristic: async (uuid: string) => {
  314 |           const characteristic = characteristics.get(
  315 |             normalize(uuid)
  316 |           )
  317 | 
  318 |           if (!characteristic) {
  319 |             throw new Error(
  320 |               `Unknown characteristic: ${uuid}`
  321 |             )
  322 |           }
  323 | 
  324 |           return characteristic
  325 |         },
  326 |       }
  327 | 
  328 |       class MockBluetoothDevice extends EventTarget {
  329 |         readonly id = "mock-snsa-device"
  330 |         readonly name = "Mock SNSA Device"
  331 | 
  332 |         readonly gatt = {
  333 |           connected: false,
  334 | 
  335 |           connect: async () => {
  336 |             this.gatt.connected = true
  337 |             return this.gatt
  338 |           },
  339 | 
  340 |           disconnect: () => {
  341 |             if (!this.gatt.connected) {
  342 |               return
  343 |             }
  344 | 
  345 |             this.gatt.connected = false
  346 | 
  347 |             this.dispatchEvent(
  348 |               new Event("gattserverdisconnected")
  349 |             )
  350 |           },
  351 | 
  352 |           getPrimaryService: async (uuid: string) => {
  353 |             if (normalize(uuid) !== normalize(serviceUUID)) {
  354 |               throw new Error(
  355 |                 `Unknown service: ${uuid}`
  356 |               )
  357 |             }
  358 | 
  359 |             return service
  360 |           },
  361 |         }
  362 |       }
  363 | 
  364 |       const device = new MockBluetoothDevice()
  365 | 
  366 |       Object.defineProperty(navigator, "bluetooth", {
  367 |         configurable: true,
  368 |         value: {
  369 |           requestDevice: async () => device,
  370 |           getDevices: async () => [device],
  371 |         },
  372 |       })
  373 |     },
  374 |     {
  375 |       serviceUUID: SNSA_SERVICE_UUID,
  376 |       pairedUUID: IS_PAIRED_UUID,
  377 |       serialUUID: SERIAL_NUMBER_UUID,
  378 |       recordCommandUUID: RECORD_COMMAND_UUID,
  379 |       recordingStatusUUID: RECORDING_STATUS_UUID,
  380 |       recordingResultUUID: RECORDING_RESULT_UUID,
  381 |       serial: serialNumber,
  382 |       paired: isPaired,
  383 |     }
  384 |   )
  385 | }
  386 | 
  387 | 
  388 | export async function addDevice(page: Page, deviceName: string){
  389 |     await page.getByRole("button", {
  390 |         name: "Toggle details",
  391 |     }).click()
  392 | 
  393 |     await page.getByRole("button", {
  394 |         name: "Add New Device",
  395 |     }).click()
  396 | 
  397 |     await expect(
  398 |         page.getByText("Adding your SNSA device")
  399 |     ).toBeVisible()
  400 | 
  401 |     await page.getByLabel("Device Name").fill(deviceName)
  402 | 
  403 |     await page.getByRole("button", {
  404 |         name: "Add Device",
  405 |     }).click()
  406 | 
  407 |     await expect(
  408 |         page.getByText("Device Add Successful")
> 409 |     ).toBeVisible()
      |      ^ Error: expect(locator).toBeVisible() failed
  410 | 
  411 |     await expect(
  412 |         page.getByTestId("selected-device")
  413 |     ).toHaveText(deviceName)
  414 | }
  415 | 
  416 | export async function addSound(page: Page, soundName:string){
  417 | 
  418 |     await page
  419 |       .getByRole("button", { name: "Add Sound" })
  420 |       .click()
  421 | 
  422 |     await expect(
  423 |       page.getByRole("heading", {
  424 |         name: "Record and Save your Sound",
  425 |       })
  426 |     ).toBeVisible()
  427 | 
  428 |     await page
  429 |       .getByRole("button", { name: "Start Recording" })
  430 |       .click()
  431 | 
  432 |     await expect(page.getByText("Starting...")).toBeVisible()
  433 |     await expect(page.getByText("Recording...")).toBeVisible()
  434 |     await expect(page.getByText("Processing...")).toBeVisible()
  435 | 
  436 |     await expect(
  437 |       page.getByRole("button", { name: "Save Sound" })
  438 |     ).toBeVisible()
  439 | 
  440 |     await page
  441 |       .getByLabel("Sound Name")
  442 |       .fill(soundName)
  443 | 
  444 |     const createResponsePromise =
  445 |       page.waitForResponse((response) => {
  446 |         const url = new URL(response.url())
  447 | 
  448 |         return (
  449 |           response.request().method() === "POST" &&
  450 |           url.pathname.includes("/sound/")
  451 |         )
  452 |       })
  453 |     
  454 |     await page.getByRole("button", { name: "Save Sound" }).click()
  455 | 
  456 |     await expect(
  457 |       page.getByText("Sound Added Successfully")
  458 |     ).toBeVisible()
  459 | 
  460 |     const createResponse = await createResponsePromise
  461 | 
  462 |     expect(createResponse.ok()).toBeTruthy()
  463 | 
  464 |     await expect(
  465 |       page.getByText(soundName)
  466 |     ).toBeVisible()  
  467 | }
```