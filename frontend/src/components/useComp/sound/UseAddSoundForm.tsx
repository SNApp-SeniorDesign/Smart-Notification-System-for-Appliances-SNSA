"use client"

import * as React from "react"
import * as z from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { getToken } from "@/lib/auth"
import {
  startSNSARecording,
  waitForRecordingCompletion,
  readSNSARecordingResult,
} from "@/lib/bluetooth"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const formSchema = z.object({
  sound_name: z
    .string()
    .trim()
    .min(1, "Sound Name is required"),
})

type Sound = {
  id: number
  device_id: number
  sound_name: string
  sound_file_url: string
  sound_status: string
  is_synced_to_device: boolean
  profile_version: number
  is_on: boolean
}

type AddSoundStatus =
  | "idle"
  | "starting"
  | "recording"
  | "processing"
  | "naming"
  | "uploading"
  | "complete"
  | "failed"

type AddSoundFormProps = {
  deviceID: number
  deviceSerialNumber: string
  onSuccess?: (sound: Sound) => void
}

export function AddSoundForm({
  onSuccess,
  deviceID,
  deviceSerialNumber,
}: AddSoundFormProps) {
  const [status, setStatus] =
    React.useState<AddSoundStatus>("idle")

  const [recordingFile, setRecordingFile] =
    React.useState<File | null>(null)

  const isMountedRef = React.useRef(true)

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const buttonText: Record<AddSoundStatus, string> = {
    idle: "Start Recording",
    starting: "Starting...",
    recording: "Recording...",
    processing: "Processing...",
    naming: "Save Sound",
    uploading: "Saving...",
    complete: "Complete",
    failed: "Try Again",
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sound_name: "",
    },
  })

  async function transitionStatus(
    currentStatus: AddSoundStatus,
    delayMs = 750,
    nextStatus?: AddSoundStatus
  ): Promise<void> {
    setStatus(currentStatus)

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, delayMs)
    })

    if (nextStatus && isMountedRef.current) {
      setStatus(nextStatus)
    }
  }

  function getRequestRequirements() {
    const token = getToken()

    if (!token) {
      toast.error("You are not authenticated", {
        position: "top-center",
      })

      return null
    }

    if (!API_URL) {
      toast.error("API URL is not configured", {
        position: "top-center",
      })

      return null
    }

    return {
      token,
      apiURL: API_URL,
    }
  }

  async function handleStartRecording() {
    if (status !== "idle" && status !== "failed") {
      return
    }

    if(!("bluetooth" in navigator)){
      toast.error(
        "Bluetooth is not supported in this browser",
        {
          position: "top-center"
        }
      )
      return
    }

    const requestRequirements =
      getRequestRequirements()

    if (!requestRequirements) {
      return
    }

    const { token, apiURL } = requestRequirements

    setRecordingFile(null)
    form.reset()
    setStatus("starting")

    try {
      const response = await fetch(
        `${apiURL}/recording/${deviceID}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        let detail = "Unable to start recording"

        try {
          const errorData = await response.json()
          detail = errorData?.detail ?? detail
        } catch {
          detail = response.statusText || detail
        }

        throw new Error(detail)
      }

      await waitForRecordingCompletion(
        deviceSerialNumber,
        () =>
          startSNSARecording(deviceSerialNumber),
        (recordingStatus) => {
          switch (recordingStatus) {
            case "recording":
              setStatus("recording")
              break

            case "processing":
              setStatus("processing")
              break

            case "completed":
            case "failed":
              break
          }
        }
      )

      const file = await readSNSARecordingResult(
        deviceSerialNumber
      )

      setRecordingFile(file)
      setStatus("naming")
    } catch (error) {
      console.error(
        "Failed to start recording",
        error
      )

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start recording",
        {
          position: "top-center",
        }
      )

      setRecordingFile(null)
      setStatus("failed")
    }
  }

  async function onSubmit(
    data: z.infer<typeof formSchema>
  ) {
    if (status !== "naming") {
      return
    }

    const requestRequirements =
      getRequestRequirements()

    if (!requestRequirements) {
      return
    }

    const { token, apiURL } = requestRequirements

    if (!recordingFile) {
      toast.error(
        "No completed recording is available",
        {
          position: "top-center",
        }
      )

      setStatus("failed")
      return
    }

    setStatus("uploading")

    const formData = new FormData()

    formData.append("sound_name", data.sound_name)
    formData.append("device_id", String(deviceID))
    formData.append("file", recordingFile)

    try {
      const response = await fetch(
        `${apiURL}/sound/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        let detail = "Unknown error"

        try {
          const errorData = await response.json()
          detail = errorData?.detail ?? detail
        } catch {
          detail = response.statusText || detail
        }

        toast.error(
          `Adding sound failed: ${detail}`,
          {
            position: "top-center",
          }
        )

        setStatus("naming")
        return
      }

      const newSound: Sound =
        await response.json()

      toast.success("Sound added successfully", {
        position: "top-center",
      })

      setRecordingFile(null)
      form.reset()

      await transitionStatus(
        "complete",
        750,
        "idle"
      )

      onSuccess?.(newSound)
    } catch (error) {
      console.error("Failed to add sound", error)

      toast.error(
        "Unable to connect to the server.",
        {
          position: "top-center",
        }
      )

      setStatus("naming")
    }
  }

  const recordingIsInProgress =
    status === "starting" ||
    status === "recording" ||
    status === "processing"

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader />
        <CardTitle> Recording & Save Sound</CardTitle>
        <CardContent>
          <form
            id="Add-Sound-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              {status === "naming" && (
                <Controller
                  name="sound_name"
                  control={form.control}
                  render={({
                    field,
                    fieldState,
                  }) => (
                    <Field
                      data-invalid={
                        fieldState.invalid
                      }
                    >
                      <FieldLabel htmlFor="sound_name">
                        Sound Name
                      </FieldLabel>

                      <Input
                        {...field}
                        id="sound_name"
                        aria-invalid={
                          fieldState.invalid
                        }
                        placeholder="Laundry"
                        autoComplete="off"
                        autoFocus
                      />

                      {fieldState.invalid && (
                        <FieldError
                          errors={[
                            fieldState.error,
                          ]}
                        />
                      )}
                    </Field>
                  )}
                />
              )}

              <Field>
                {status === "idle" ||
                status === "failed" ? (
                  <Button
                    type="button"
                    onClick={
                      handleStartRecording
                    }
                  >
                    {buttonText[status]}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      form.formState
                        .isSubmitting ||
                      recordingIsInProgress ||
                      status === "uploading" ||
                      status === "complete"
                    }
                  >
                    {buttonText[status]}
                  </Button>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}