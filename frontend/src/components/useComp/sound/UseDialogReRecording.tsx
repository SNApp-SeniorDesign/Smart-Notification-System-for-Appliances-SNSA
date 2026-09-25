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

import * as React from "react"

type ReRecordSoundDialogProps = {
    showTrigger?: boolean
    deviceID: number
    SoundID: number
    deviceSerialNumber: string
}


export function UseDialogReRecordSound({
  showTrigger = true,
  deviceID,
  SoundID,
  deviceSerialNumber,
}: ReRecordSoundDialogProps)
{  const [open, setOpen] = React.useState(false)
  const { refreshSounds } = useDashboardContext()
  function handleSoundAdded(){
    setOpen(false)
    refreshSounds()
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
        {showTrigger && (
          <DialogTrigger
          render={
            <Button className="w-full">
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