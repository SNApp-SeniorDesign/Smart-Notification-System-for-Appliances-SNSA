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
    sound_name: z.string()
                  .trim()
                  .min(1,"Sound Name is required")
})


type Sound = {
  id: number
  device_id: number
  sound_name: string
  sound_file_url: string
  sound_status: string
  is_synched_to_device: boolean
  profile_version: number
  processing_status: string
}

type AddSoundFormProps = {
    deviceID: number
    onSuccess?: (sound: Sound) => void
}

export function AddSoundForm({
  onSuccess,
  deviceID,
  ...props
}: AddSoundFormProps) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sound_name:"",
        }
    })
    async function onSubmit(data: z.infer<typeof formSchema>){
      
      const token = getToken();  
      
        const res = await fetch(`${API_URL}/sound/register`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sound_name: data.sound_name,
              device_id: deviceID,
            }),
          })

        if(!res.ok){
          const errorData = await res.json()
          toast.error(`Adding sound failed: ${errorData?.detail || "Unknown error"}`, {
            position: "top-center",
          })
          return
        }

        const newSound: Sound = await res.json()

        toast.success("Sound Add Successful", {
          position: "top-center",
        })
        form.reset()
        onSuccess?.(newSound)
    } 
 
  return (
    <div className={cn("flex flex-col gap-6")} {...props}>
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form id="Add-Sound-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="sound_name"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="device_name">Sound Name</FieldLabel>
                    <Input
                      {...field}
                      id="sound_name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Laundry"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />              
              <Field>
                <Button type="submit">Add Sound</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
