export const SNSA_SERVICE_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A58A7"

export const SERIAL_NUMBER_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5801"

export const IS_PAIRED_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5802"

export const RECORD_COMMAND_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5803"


const snsaDevices = new Map<string, SNSABluetoothDevice>

type SNSAGATTServer =
  NonNullable<SNSABluetoothDevice["gatt"]>

type SNSAGATTService = Awaited<
  ReturnType<SNSAGATTServer["getPrimaryService"]>
>

export async function selectSNSADevice():
  Promise<SNSABluetoothDevice> {
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

  const server = await gatt.connect()

  const service = await server.getPrimaryService(
    SNSA_SERVICE_UUID
  )

  const serialChar = await service.getCharacteristic(
    SERIAL_NUMBER_UUID
  )

  const serialValue = await serialChar.readValue()

  const serialNumber = new TextDecoder().decode(serialValue)

  snsaDevices.set(serialNumber, device)

  return device
}

export async function restoreSNSADevice():
  Promise<SNSABluetoothDevice | null> {
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
      new TextDecoder().decode(serialValue)

      snsaDevices.set(serialNumber,device)

    } catch {
      //ignore unreachable device
    }


  }
}

export function getSelectedSNSADevice():
  SNSABluetoothDevice | null {
  return snsaDevices
}

export async function getSNSAService(
  serialNumber: string
):
  Promise<SNSAGATTService> {
  
    const device = snsaDevices.get(serialNumber)
  
    if (device) {
      throw new Error("No SNSA device has been selected")
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

export function disconnectALLSNSA(): void {
  for(const device of snsaDevices.values()){
    device.gatt?.disconnect()
  }
  snsaDevices.clear()
}