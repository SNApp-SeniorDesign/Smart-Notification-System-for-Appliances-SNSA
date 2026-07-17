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

import { UseDialAddDevice } from "@/components/useComp/UseDialogAddDevice"
import { getToken } from "@/lib/auth"

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
        <span className="text-muted-foreground">
            {selectedDevice?.device_name ?? "Device Name" }
        </span>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="size-8"><ChevronsUpDown /><span className="sr-only">Toggle details</span></Button>} />
      </div>
      <div className="h-fit border w-max rounded-md px-[40%] bg-gray-200">
        <CollapsibleContent className="flex flex-col gap-2">
            {devices.map((device) => (
                <Button
                    key={device.id}
                    variant="ghost"
                    onClick = { () => {
                        setSelectedDevice(device)
                        setIsOpen(false)
                    }}
                >
                    {device.device_name}
                </Button>
            ))}
            <div className="rounded-md px-4 py-2 text-sm">
                <UseDialAddDevice 
                    open={DeviceOpen}
                    onOpenChange = {SetDeviceOpen}
                />
            </div>
      </CollapsibleContent>
      </div>

    </Collapsible>
  )
}
