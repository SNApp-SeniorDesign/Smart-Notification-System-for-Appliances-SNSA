export const SNSA_SERVICE_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A58A7"

export const SERIAL_NUMBER_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5801"

export const IS_PAIRED_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5802"

export const RECORD_COMMAND_UUID =
  "55A7DC43-48C1-4AD8-BC31-F3D6F08A5803"

let snsaDevice: SNSABluetoothDevice | null = null

type SNSAGATTServer =
  NonNullable<SNSABluetoothDevice["gatt"]>

type SNSAGATTService = Awaited<
  ReturnType<SNSAGATTServer["getPrimaryService"]>
>

export async function selectSNSADevice():
  Promise<SNSABluetoothDevice> {
  snsaDevice = await navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [SNSA_SERVICE_UUID],
      },
    ],
  })

  return snsaDevice
}

export async function restoreSNSADevice():
  Promise<SNSABluetoothDevice | null> {
  const devices = await navigator.bluetooth.getDevices()

  snsaDevice = devices[0] ?? null

  return snsaDevice
}

export function getSelectedSNSADevice():
  SNSABluetoothDevice | null {
  return snsaDevice
}

export async function getSNSAService():
  Promise<SNSAGATTService> {
  if (!snsaDevice) {
    throw new Error("No SNSA device has been selected")
  }

  const gatt = snsaDevice.gatt

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

export async function startSNSARecording():
  Promise<void> {
  const service = await getSNSAService()

  const characteristic =
    await service.getCharacteristic(
      RECORD_COMMAND_UUID
    )

  const command =
    new TextEncoder().encode("START_RECORDING")

  await characteristic.writeValueWithResponse(command)
}

export function disconnectSNSA(): void{
  snsaDevice?.gatt.disconnect()
  snsaDevice = null
}