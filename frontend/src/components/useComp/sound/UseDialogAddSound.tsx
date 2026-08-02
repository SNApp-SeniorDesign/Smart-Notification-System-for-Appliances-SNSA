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
import { useDashboardContext } from "../general/DashboardContext"

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
  const { refreshSounds } = useDashboardContext()
  function handleSoundAdded(){
    onOpenChange(false)
    refreshSounds()
  }
  return (
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
              onSuccess={handleSoundAdded}
            />
        </DialogContent>
    </Dialog>
  )
}   