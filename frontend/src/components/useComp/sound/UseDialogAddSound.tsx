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
import {AddSoundForm} from "./UseAddSoundForm"

type DialoginProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger?: boolean
  deviceID: number
  deviceSerialNumber: string
}


export function UseDialogAddSound({
  open,
  onOpenChange,
  showTrigger = true,
  deviceID,
  deviceSerialNumber,
}: DialoginProps)
{  
  return (
//Dialog component are open
    <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger
          render={
            <Button>
              Add Sound
            </Button>
          }
        />
        )}
     
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record and Save your Sound</DialogTitle>
            <DialogDescription>
                Click the button below to start recording your sound. Once the recording is complete, you can name and save it to your device.
            </DialogDescription>
          </DialogHeader>
            <AddSoundForm
              deviceID={deviceID}
              deviceSerialNumber={deviceSerialNumber}
            />
        </DialogContent>
    </Dialog>
  )
}   