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
import {ReRecordSoundForm} from "./UseReRecordSoundForm"
import { useDashboardContext } from "../general/DashboardContext"

type ReRecordSoundDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger?: boolean
  deviceID: number
  SoundID: number
  deviceSerialNumber: string
}


export function UseDialogReRecordSound({
  open,
  onOpenChange,
  showTrigger = true,
  deviceID,
  SoundID,
  deviceSerialNumber,
}: ReRecordSoundDialogProps)
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
              Record Sound Again
            </Button>
          }
        />
        )}
     
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record and Save your Sound</DialogTitle>
            <DialogDescription>
                Click the button below to start recording your sound.
            </DialogDescription>
          </DialogHeader>
            <ReRecordSoundForm
              SoundID={SoundID}
              deviceID={deviceID}
              deviceSerialNumber={deviceSerialNumber}
              onSuccess={handleSoundAdded}
            />
        </DialogContent>
    </Dialog>
  )
}   