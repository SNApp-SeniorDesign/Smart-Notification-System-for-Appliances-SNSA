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
import {Controller, useForm} from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { getToken } from "@/lib/auth"


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
    device_name: z.string()
                  .trim()
                  .min(1,"Device Name is required")
})


export function LogForm({
  ...props
}) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            device_name:"",
        }
    })
    async function onSubmit(data: z.infer<typeof formSchema>){
      const token = getToken();  
      
      if (!("bluetooth" in navigator)) {
        toast.error("Bluetooth is not supported in this browser. Use Chrome or Edge",{
          position: "top-center",
        })
        return
      }
      try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [
              { namePrefix: "SNSA"}
            ]
        })

        const server = await device.gatt?.connect()

        const serialNumber = "..."

      
        const res = await fetch(`${API_URL}/device/`,{
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`,
            },
            body: new URLSearchParams({
              device_name: data.device_name,
              serial_number: serialNumber,
            }).toString(),
          })

        if(!res.ok){
          const errorData = await res.json()
          toast.error(`Adding device failed: ${errorData?.message || "Unknown error"}`, {
            position: "top-center",
          })
          return
        }

        if(res.status !== 201){
          toast.error("Unexpected response from server. Please try again later.",{
              position: "top-center",
          })
        }
    
        toast.success("Device Add Successful", {
          position: "top-center",
        })
        form.reset()
      } catch {
        toast.error("Failed to add device. Please try again", {
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
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="device_name"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Device Name</FieldLabel>
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
                <Button type="submit">Add Device</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
