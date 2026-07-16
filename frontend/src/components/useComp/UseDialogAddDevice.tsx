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

type DialDeviceProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger?: boolean
}


export function UseDialAddDevice({
  open,
  onOpenChange,
  showTrigger = true,
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
              onSuccess={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
  )
}   