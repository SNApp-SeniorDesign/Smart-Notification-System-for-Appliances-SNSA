import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DeviceForm } from "./UseDeviceForm"

type DialogFormProps = {
    deviceID: number
    device_name: string,
}

export function DialogDeviceForm({
    deviceID,
    device_name
}: DialogFormProps) {
  return (
    <Dialog>
        <DialogTrigger render={<Button variant="outline">{device_name}</Button>} />
        <DialogContent className="sm:max-w-sm">
          <DeviceForm deviceID = {deviceID}/>
        </DialogContent>
    </Dialog>
  )
}
