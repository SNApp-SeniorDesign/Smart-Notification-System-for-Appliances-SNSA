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
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { getToken } from "@/lib/auth"
import { toast } from "sonner"


import type { Sound } from "@/components/useComp/sound/UseSoundCard"
import { AlertDialogSoundDelete } from "@/components/useComp/sound/UseDialogDeleteSound"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type DialogSoundFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sound: Sound | null
  onDeleteSuccess: (soundID: number) => void
}

const formSchema = z.object({
  sound_name: z.string()
    .trim()
    .optional()
    .or(z.literal(""))
})

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sound_name: "",
    }
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const token = getToken()

    if (!token) {
      toast.error("You are not authenticated", {
        position: "top-center"
      })
      return
    }

    if (!API_URL) {
      toast.error("API is not configured", {
        position: "top-center",
      })
      return
    }

    if(!sound) {
      toast.error("Selected Sound does not exist", {
        position: "top-center",
      })
      return
    }

    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        const fieldState = form.getFieldState(key as keyof z.infer<typeof formSchema>)
        return fieldState.isDirty && value != ""
      })
    )

    if (Object.keys(filteredData).length === 0) {
      toast.error("no changes to save")
      return
    }

    const res = await fetch(`${API_URL}/${sound.device_id}/${sound.id}/update`, {
      method: "PUT",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filteredData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      toast.error(`Updating failed: ${errorData.message || "Unkown error"}`, {
        position: "top-center",
      })
      return
    }

    await res.json()

    toast.success("Sound Name updated successfully", {
      position: "top-center"
    })

    form.reset({
      sound_name: "",
    })

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

        <form id="Sound-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>

            <Controller
              name="sound_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sound_name" className="text-gray-700 dark:text-slate-200">
                    New Sound Name
                  </FieldLabel>

                  <Input
                    {...field}
                    id="sound_name"
                    aria-invalid={fieldState.invalid}
                    placeholder=""
                    autoComplete="off"

                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}

            />
          </FieldGroup>


          <Button type="submit">
            Update Sound Name
          </Button>

          <FieldGroup>
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
        </form>


      </DialogContent>
    </Dialog>
  )
}