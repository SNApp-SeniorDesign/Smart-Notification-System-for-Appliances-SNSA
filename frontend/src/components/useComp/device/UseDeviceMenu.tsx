"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { UseDialAddDevice } from "@/components/useComp/device/UseDialogAddDevice"
import { getToken } from "@/lib/auth"
import {DialogDeviceForm} from "@/components/useComp/device/UseDialogDeviceForm"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type Device = {
    id: number
    device_name: string
    serial_number: string
    user_id: number
    device_status: string
    is_paired: boolean
}

export function CollapsibleDeviceMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [DeviceOpen, SetDeviceOpen] = React.useState(false)
  const [devices, setDevices] = React.useState<Device[]>( [] )
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null> (null)

  const [deviceFormOpen, setDeviceFormOpen] = React.useState(false)
  const [deviceForForm, setDeviceForForm] = React.useState<Device | null>(null)
  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressTriggered = React.useRef(false)

  async function fetchDevices() {
    const token = getToken()

    const res = await fetch(`${API_URL}/device/all`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if(!res.ok){
        toast.error("Failed loading devices list. Please try again later.")
        return
    }

    const data = await res.json()
    setDevices(data)    
  }

  //function to run when user hold the device name
  function handlePointerDown(device: Device){
    longPressTriggered.current = false

    pressTimer.current = setTimeout(() => {
        longPressTriggered.current = true
        setDeviceForForm(device)
        setDeviceFormOpen(true)
    }, 700)
  }

  //function when user let go the device name
  function handlePointerUp(device: Device){
    if (pressTimer.current) {
        clearTimeout(pressTimer.current)
        pressTimer.current = null
    }

    if(!longPressTriggered.current){
        setSelectedDevice(device)
        setIsOpen(false)
    }
  }

  //function when user move away before timer finish
  function cancelLongPress(){
    if (pressTimer.current){
        clearTimeout(pressTimer.current)
        pressTimer.current = null
    }
  }

  React.useEffect(() => {
        if (isOpen) {
            fetchDevices()
        }
    }, [isOpen])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-screen flex-col gap-2 items-center"
    >
      <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm w-screen h-fit">
        <span
            data-testid="selected-device"
            className="text-muted-foreground"
        >
            {selectedDevice?.device_name ?? "Device Name" }
        </span>
        <CollapsibleTrigger render={
            <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="size-8">
                    <ChevronsUpDown />
                        <span className="sr-only">Toggle details</span>
            </Button>} />
      </div>
      <div className="h-fit border w-max rounded-md px-[40%] bg-gray-200">
        <CollapsibleContent className="flex flex-col gap-2">
            {devices.map((device) => (
                <Button
                    key={device.id}
                    type="button"
                    variant="ghost"
                    onPointerDown={() => handlePointerDown(device)}
                    onPointerUp={() => handlePointerUp(device)}
                    onPointerLeave={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                >
                    {device.device_name}
                </Button>
            ))}
            {deviceForForm && (
                <DialogDeviceForm
                    open={deviceFormOpen}
                    onOpenChange={(open) => {
                        setDeviceFormOpen(open)

                        if(!open){
                            setDeviceForForm(null)
                        }
                    }}
                    deviceID={deviceForForm.id}
                    onDeleteSuccess={() => {
                        const deletedDeviceID = deviceForForm.id

                        setDevices((currentDevices) => 
                            currentDevices.filter(
                                (device) => device.id !==deletedDeviceID
                            )
                        )

                        setSelectedDevice((currentSelectedDevice) =>
                            currentSelectedDevice?.id === deletedDeviceID
                            ? null
                            : currentSelectedDevice
                        )

                        setDeviceFormOpen(false)
                        setDeviceForForm(null)
                    }}
                />
            )}
            <div className="rounded-md px-4 py-2 text-sm">
                <UseDialAddDevice 
                    open={DeviceOpen}
                    onOpenChange = {SetDeviceOpen}
                    onSuccess={(newDevice) => {
                        setDevices((prev) => [...prev, newDevice])
                        setSelectedDevice(newDevice)
                        setIsOpen(false)
                    }}
                />
            </div>
      </CollapsibleContent>
      </div>

    </Collapsible>
  )
}
