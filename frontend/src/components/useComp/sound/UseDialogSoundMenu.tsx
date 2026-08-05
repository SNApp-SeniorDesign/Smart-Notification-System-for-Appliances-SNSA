"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { Sound } from "@/components/useComp/sound/UseSoundCard"
import { AlertDialogSoundDelete } from "@/components/useComp/sound/UseDialogDeleteSound"

type DialogSoundFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sound: Sound | null
  onDeleteSuccess: (soundID: number) => void
}

export function DialogSoundForm({
  open,
  onOpenChange,
  sound,
  onDeleteSuccess,
}: DialogSoundFormProps) {
  const [soundName, setSoundName] = React.useState("")

  React.useEffect(() => {
    if (sound) {
      setSoundName(sound.sound_name)
    }
  }, [sound])

  if (!sound) {
    return null
  }

  function handleDeleteSuccess(soundID: number): void {
    onDeleteSuccess(soundID)

    // Close the Sound Settings dialog after successful deletion.
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Sound Settings
          </DialogTitle>

          <DialogDescription>
            Update, record again, or delete this sound.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="sound-name">
              Sound Name
            </FieldLabel>

            <Input
              id="sound-name"
              value={soundName}
              onChange={(event) =>
                setSoundName(event.target.value)
              }
            />
          </Field>

          <Field>
            <Button
              type="button"
              disabled
            >
              Update Sound Name
            </Button>
          </Field>

          <Field>
            <Button
              type="button"
              variant="outline"
              disabled
            >
              Record Sound Again
            </Button>
          </Field>

          <Field>
            <AlertDialogSoundDelete
              sound={sound}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </Field>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  )
}