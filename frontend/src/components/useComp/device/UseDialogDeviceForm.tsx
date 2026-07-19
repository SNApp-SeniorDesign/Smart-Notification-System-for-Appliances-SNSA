import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { DeviceForm } from "./UseDeviceForm"

type DialogFormProps = {
    deviceID: number,
    open: boolean,
    onOpenChange: (open: boolean) => void
}

export function DialogDeviceForm({
    deviceID,
    open,
    onOpenChange,
}: DialogFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DeviceForm deviceID = {deviceID}/>
        </DialogContent>
    </Dialog>
  )
}
