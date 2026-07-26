"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
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
import { toast } from "sonner"
import { getToken } from "@/lib/auth"
import {
  selectSNSADevice,
  isSNSAPaired,
  setSNSAPaired,
  disconnectSNSA,
} from "@/lib/bluetooth"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
  device_name: z.string()
    .trim()
    .min(1, "Device Name is required")
})


type Device = {
  id: number
  device_name: string
  serial_number: string
  user_id: number
  device_status: string
  is_paired: boolean
}

type AddDeviceFormProps = {
  onSuccess?: (device: Device) => void
}

export function AddDeviceForm({
  onSuccess,
  ...props
}: AddDeviceFormProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device_name: "",
    }
  })
  async function onSubmit(data: z.infer<typeof formSchema>) {

    const token = getToken();

    if (!("bluetooth" in navigator)) {
      toast.error("Bluetooth is not supported in this browser. Use Chrome or Edge", {
        position: "top-center",
      })
      return
    }

    if (!token) {
      toast.error("You must be signed in", {
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

    try {
      const { serialNumber } = await selectSNSADevice()

      const isPaired = await isSNSAPaired(serialNumber)

      if (isPaired) {
        disconnectSNSA(serialNumber)
        toast.error("Device already paired to another account", {
          position: "top-center",
        })
        return
      }

      const res = await fetch(`${API_URL}/device/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          device_name: data.device_name,
          serial_number: serialNumber,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        toast.error(`Adding device failed: ${errorData?.detail || "Unknown error"}`, {
          position: "top-center",
        })
        return
      }

      const newDevice: Device = await res.json()

      try {
        await setSNSAPaired(serialNumber, true)
      } catch (bluetoothError) {
        console.error(
          "Failed to update Bluetooth pairing status:",
          bluetoothError
        )

        try {
          const rollbackRes = await fetch(
            `${API_URL}/device/${newDevice.id}/delete`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (!rollbackRes.ok) {
            throw new Error("Rollback request failed")
          }
        } catch (rollbackError) {
          console.error(
            "Failed to roll back backend device registration:",
            rollbackError
          )

          toast.error(
            "The device was registered, but Bluetooth pairing failed. Please remove the device and try again.",
            {
              position: "top-center",
            }
          )

          return
        }

        toast.error(
          "Bluetooth pairing failed. Device registration was rolled back.",
          {
            position: "top-center",
          }
        )

        return
      }

      toast.success("Device Add Successful", {
        position: "top-center",
      })
      form.reset()
      onSuccess?.(newDevice)
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to add device. Please try again", {
        position: "top-center",
      })
    }

  }


  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form id="Add-Device-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="device_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="device_name">Device Name</FieldLabel>
                    <Input
                      {...field}
                      id="device_name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Laundry SNSA"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  Add Device
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
