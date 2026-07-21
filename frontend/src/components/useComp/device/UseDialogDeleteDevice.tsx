"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { getToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type DeleteDeviceDialogProps = {
    deviceID: number,
    onDeleteSuccess:() => void
}

export function AlertDialogDeviceDelete({
    deviceID,
    onDeleteSuccess,
}: DeleteDeviceDialogProps) {

    async function handleDeleteDevice() {
    
    const token = getToken()

    try {
      const res = await fetch(`${API_URL}/device/${deviceID}/delete`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        toast.error("Failed to delete device. Please try again later.", {
          position: "top-center",
        })
        return
      }

     
      toast.success("Device deleted successfully", {
        position: "top-center",
      })

      onDeleteSuccess()

    } catch {
      toast.error("Failed to delete device. Please try again later.", {
        position: "top-center",
      })
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button type= "button" variant="destructive"> Delete Device </Button>
        } />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            device from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={handleDeleteDevice}
            >
                Delete Device
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
