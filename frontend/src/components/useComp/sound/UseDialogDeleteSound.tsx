"use client"

import * as React from "react"
import { toast } from "sonner"

import { getToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
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

import type { Sound } from "@/components/useComp/sound/UseSoundCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type AlertDialogSoundDeleteProps = {
  sound: Sound
  onDeleteSuccess: (soundID: number) => void
}

export function AlertDialogSoundDelete({
  sound,
  onDeleteSuccess,
}: AlertDialogSoundDeleteProps) {
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDeleteSound(): Promise<void> {
    if (isDeleting) {
      return
    }

    const token = getToken()

    if (!token) {
      toast.error("You are not authenticated", {
        position: "top-center",
      })
      return
    }

    if (!API_URL) {
      toast.error("API URL is not configured", {
        position: "top-center",
      })
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(
        `${API_URL}/sound/${sound.device_id}/${sound.id}/delete`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        let detail = "Unable to delete sound"

        try {
          const errorData = await response.json()
          detail = errorData?.detail ?? detail
        } catch {
          detail = response.statusText || detail
        }

        throw new Error(detail)
      }

      toast.success("Sound deleted successfully", {
        position: "top-center",
      })

      onDeleteSuccess(sound.id)
      setOpen(false)
    } catch (error) {
      console.error("Failed to delete sound", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete sound",
        {
          position: "top-center",
        }
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          setOpen(nextOpen)
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
          >
            Delete Sound
          </Button>
        }
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete this sound?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This will permanently delete “{sound.sound_name}” and
            its recording. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            type="button"
            disabled={isDeleting}
            onClick={(event) => {
              // Prevent the alert dialog from closing before the
              // asynchronous request has completed.
              event.preventDefault()
              void handleDeleteSound()
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}