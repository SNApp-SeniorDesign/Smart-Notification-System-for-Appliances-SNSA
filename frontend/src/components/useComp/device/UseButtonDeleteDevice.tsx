"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

//Type to obtain device_id

type DeleteDeviceButtonProps = {
    deviceID: number
}

export function UseDeleteDeviceButton({
    deviceID,
}: DeleteDeviceButtonProps ){

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

    } catch {
      toast.error("Failed to delete device. Please try again later.", {
        position: "top-center",
      })
    }
  }

  return (
    <Button variant="destructive" onClick={handleDeleteDevice}>
      Delete Device
    </Button>
  )
}