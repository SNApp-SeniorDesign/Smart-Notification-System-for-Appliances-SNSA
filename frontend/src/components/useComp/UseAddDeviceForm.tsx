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
import {
  SNSA_SERVICE_UUID,
  SERIAL_NUMBER_UUID,
  IS_PAIRED_UUID
} 
from "@/lib/bluetooth"

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

      let device: SNSABluetoothDevice | undefined;
      
      try {
        device = await navigator.bluetooth.requestDevice({
            filters: [
              { services: [SNSA_SERVICE_UUID]},
            ]
        })

        const server = await device.gatt?.connect()

        if(!server){
          throw new Error("Unable to connect SNSA device.")
        }

        const service = await server.getPrimaryService(SNSA_SERVICE_UUID);

        //Read Pairing status
        const pairedChar = await service.getCharacteristic(IS_PAIRED_UUID)
        const pairedValue = await pairedChar.readValue()
        const is_paired = pairedValue.getUint8(0) === 1
        
        if(is_paired){
          toast.error("Device already paired to another account",{
            position:"top-center",
          })
          return
        }
        
        //Read Serial Number
        const serialChar = await service.getCharacteristic(SERIAL_NUMBER_UUID)
        const serialValue = await serialChar.readValue()
        const serialNumber = new TextDecoder().decode(serialValue)

        const res = await fetch(`${API_URL}/device/`,{
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

        if(!res.ok){
          const errorData = await res.json()
          toast.error(`Adding device failed: ${errorData?.detail || "Unknown error"}`, {
            position: "top-center",
          })
          return
        }

        await pairedChar.writeValue(
          Uint8Array.of(1)
        )

        toast.success("Device Add Successful", {
          position: "top-center",
        })
        form.reset()
        
      } catch (err) {
        console.error(err)
        toast.error("Failed to add device. Please try again", {
          position: "top-center",
        })
      } finally {
          device?.gatt?.disconnect()
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
