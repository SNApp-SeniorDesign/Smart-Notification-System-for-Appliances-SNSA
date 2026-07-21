"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { DeviceForm } from "./UseDeviceForm"

type DialogFormProps = {
  deviceID: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleteSuccess: () => void
}

export function DialogDeviceForm({
  deviceID,
  open,
  onOpenChange,
  onDeleteSuccess,
}: DialogFormProps) {
  const ignoreNextClose = React.useRef(false)

  React.useEffect(() => {
    if (!open) {
      ignoreNextClose.current = false
      return
    }

    ignoreNextClose.current = true

    const timeout = window.setTimeout(() => {
      ignoreNextClose.current = false
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [open])

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails: {
      reason: string
      cancel: () => void
    }
  ) {
    if (
      !nextOpen &&
      ignoreNextClose.current &&
      eventDetails.reason === "outside-press"
    ) {
      eventDetails.cancel()
      ignoreNextClose.current = false
      return
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-sm">
        <DeviceForm
          deviceID={deviceID}
          onDeleteSuccess={onDeleteSuccess}
        />
      </DialogContent>
    </Dialog>
  )
}