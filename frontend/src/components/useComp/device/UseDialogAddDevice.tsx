"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddDeviceForm } from "@/components/useComp/UseAddDeviceForm"


type Device = {
  id: number
  device_name: string
  serial_number: string
  user_id: number
  device_status: string
  is_paired: boolean
}

type DialDeviceProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger?: boolean
  onSuccess?: (device: Device) => void
}


export function UseDialAddDevice({
  open,
  onOpenChange,
  showTrigger = true,
  onSuccess,
}: DialDeviceProps)
{  
  return (
//Dialog component are open
    <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger
          render={
            <Button>
              Add New Device
            </Button>
          }
        />
        )}
     
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adding your SNSA device</DialogTitle>
            <DialogDescription>
                Naming your SNSA device
            </DialogDescription>
          </DialogHeader>
            <AddDeviceForm
              onSuccess={(device) => {
                onSuccess?.(device)
                onOpenChange(false)
              }}
            />
        </DialogContent>
    </Dialog>
  )
}   