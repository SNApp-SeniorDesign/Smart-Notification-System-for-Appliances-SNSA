export const SNSA_SERVICE_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A58A7"

export const SERIAL_NUMBER_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5801"

export const IS_PAIRED_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5802"

export const RECORD_COMMAND_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5803"

export const RECORDING_STATUS_UUID =
"55A7DC43-48C1-4AD8-BC31-F3D6F08A5804"

export const RECORDING_RESULT_UUID =
"55A7DC43-48C1-4AD8-BC31-F3D6F08A5805"

const snsaDevices = new Map<string, SNSABluetoothDevice>

type SNSAGATTServer =
  NonNullable<SNSABluetoothDevice["gatt"]>

type SNSAGATTService = Awaited<
  ReturnType<SNSAGATTServer["getPrimaryService"]>
>

type SelectedSNSADevice = {
  device: SNSABluetoothDevice
  serialNumber: string
}

export async function selectSNSADevice():
  Promise<SelectedSNSADevice> {
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [SNSA_SERVICE_UUID],
      },
    ],
  })

  const gatt = device.gatt

  if(!gatt) {
    throw new Error("The selected device does not support GATT")
  }

  const server = gatt.connected
    ? gatt
    : await gatt.connect()

  const service = await server.getPrimaryService(
    SNSA_SERVICE_UUID
  )

  const serialChar = await service.getCharacteristic(
    SERIAL_NUMBER_UUID
  )

  const serialValue = await serialChar.readValue()

  const serialNumber = new TextDecoder().decode(serialValue).trim()

  if (!serialNumber){
    throw new Error("SNSA device has no serial number")
  }

  snsaDevices.set(serialNumber, device)

  return {device, serialNumber,}
}

export async function restoreSNSADevices():
  Promise<void> {
  const devices = await navigator.bluetooth.getDevices()

  snsaDevices.clear()

  for (const device of devices){
    const gatt = device.gatt

    if(!gatt){
      continue
    }

    try {
      const server = gatt.connected
      ? gatt
      : await gatt.connect()

      const service = await server.getPrimaryService(
        SNSA_SERVICE_UUID
      )

      const serialChar = await service.getCharacteristic(
        SERIAL_NUMBER_UUID
      )

      const serialValue = await serialChar.readValue()

      const serialNumber = 
      new TextDecoder().decode(serialValue).trim()

      if(!serialNumber){
        console.warn(
          `Skipping SNSA device ${device.name ?? "unkown"}: missing serial number`
        )
        continue
      }

      snsaDevices.set(serialNumber,device)

    } catch (error) {
      console.warn(
        `Unable to restore SNSA device ${device.name ?? "unkown"}`,
        error
      )
    }


  }
}

export function getSelectedSNSADevice(
  serialNumber: string
):
  SNSABluetoothDevice | null {
  return snsaDevices.get(serialNumber) ?? null
}

export async function getSNSAService(
  serialNumber: string
):
  Promise<SNSAGATTService> {
  
    const device = snsaDevices.get(serialNumber)
  
    if (!device) {
      throw new Error(
        `SNSA device #{serialNumber} has not been selected or restored`
      )
    }

  const gatt = device.gatt

  if (!gatt) {
    throw new Error(
      "The selected device does not support GATT"
    )
  }

  const server = gatt.connected
    ? gatt
    : await gatt.connect()

  return server.getPrimaryService(SNSA_SERVICE_UUID)
}

export async function startSNSARecording(
  serialNumber: string
):
  Promise<void> {
  const service = await getSNSAService(serialNumber)

  const characteristic =
    await service.getCharacteristic(
      RECORD_COMMAND_UUID
    )

  const command =
    new TextEncoder().encode("START_RECORDING")

  await characteristic.writeValueWithResponse(command)
}

export function disconnectSNSA(
  serialNumber: string
): void{

  const device = snsaDevices.get(serialNumber)

  device?.gatt?.disconnect()
  snsaDevices.delete(serialNumber)
}

export function disconnectAllSNSA(): void {
  for(const device of snsaDevices.values()){
    device.gatt?.disconnect()
  }
  snsaDevices.clear()
}

export async function isSNSAPaired(
  serialNumber: string
): Promise<boolean>{
  const service = await getSNSAService(serialNumber)

  const characteristic =
    await service.getCharacteristic(
      IS_PAIRED_UUID
    )

    const value = await characteristic.readValue()

    return value.getUint8(0) === 1
}

export async function setSNSAPaired(
  serialNumber: string,
  paired: boolean
): Promise<void>{
  const service = await getSNSAService(serialNumber)

  const characteristic =
    await service.getCharacteristic(
      IS_PAIRED_UUID
    )

    await characteristic.writeValueWithResponse(
      Uint8Array.of(paired ? 1 : 0)
    )
}

export type SNSARecordingStatus =
  | "recording"
  | "processing"
  | "completed"
  | "failed"

export async function waitForRecordingCompletion(
  serialNumber: string,
  startRecording: () => Promise<void>,
  onStatus: (status: SNSARecordingStatus) => void,
  timeoutMs = 60_000
): Promise<void> {
  const service = await getSNSAService(serialNumber)

  const characteristic =
    await service.getCharacteristic(
      RECORDING_STATUS_UUID
    )

  return new Promise<void>(
    (resolve, reject) => {
      let timeoutID: ReturnType<typeof setTimeout> | undefined
      let settled = false

      const cleanup = async () => {
        if(timeoutID !== undefined){
          clearTimeout(timeoutID)
        }

        characteristic.removeEventListener(
          "characteristicvaluechanged",
          handleStatusChange
        )

        if (characteristic.isNotifying) {
          try {
            await characteristic.stopNotifications()
          } catch (error) {
            console.warn(
              "Unable to stop recording notifications",
              error
            )
          }
        }
      }

      const handleStatusChange = async (
        event: Event
      ) => {
        if (settled){
          return
        }
        
        const target =
          event.target as typeof characteristic

        const value = target.value

        if (!value || value.byteLength === 0) {
          return
        }

        const statusCode = value.getUint8(0)

        switch (statusCode) {
          case 1:
            onStatus("recording")
            break

          case 2:
            onStatus("processing")
            break

          case 3:
            settled = true
            onStatus("completed")
            await cleanup()
            resolve()
            break

          case 4:
            settled = true
            onStatus("failed")
            await cleanup()
            reject(
              new Error(
                "The SNSA failed to record the sound"
              )
            )
            break

          default:
            console.warn(
              "Unknown recording status code:",
              statusCode
            )
        }
      }

      characteristic.addEventListener(
        "characteristicvaluechanged",
        handleStatusChange
      )

      timeoutID = setTimeout(() => {
        if (settled) {
          return
        }

        settled = true
        
        void cleanup()

        reject(
          new Error(
            "Recording timed out. Please try again."
          )
        )
      }, timeoutMs)
      async function setupRecording() {
        try {
          await characteristic.startNotifications()
          await startRecording()
        } catch (error) {
          await cleanup()
          reject(error)
          return
        }
      }
      void setupRecording()
    }
  )
}

//FIXME: The function assuming the sound file is within the limit of wav file
//as well as SNSA will provide a full wav file instead of truncated it
//if not have to fix it
export async function readSNSARecordingResult(
  serialNumber: string
): Promise<File> {
  const service = await getSNSAService(serialNumber)

  const characteristic = 
  await service.getCharacteristic(
    RECORDING_RESULT_UUID
  )

  const value = await characteristic.readValue()

  if(value.byteLength === 0){
    throw new Error (
      "The SNSA did not return a recording result"
    )
  }

  const bytes = new Uint8Array(
    value.buffer,
    value.byteOffset,
    value.byteLength
  )

  const header = new TextDecoder("ascii")

  const isWav =
    bytes.byteLength >= 12 &&
    header.decode(bytes.subarray(0, 4)) === "RIFF" &&
    header.decode(bytes.subarray(8, 12)) === "WAVE"

  if (!isWav) {
    throw new Error (
      "The SNSA returned an invalid WAV recording"
    )
  }

  return new File(
    [bytes],
    `snsa-${serialNumber}.wav`,
    {
      type: "audio/wav"
    }
  )
}