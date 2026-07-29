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
import * as React from "react"
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
  sound_file_url: string | null
  sound_status: string
  is_synced_to_device: boolean
  profile_version: number
  processing_status: string
  is_on: boolean
}

type AddSoundStatus = 
  | "idle" 
  | 'starting' 
  | "recording" 
  | "processing" 
  | "naming"
  | "uploading" 
  | "complete" 
  | "failed"

type AddSoundFormProps = {
    deviceID: number
    onSuccess?: (sound: Sound) => void
}

export function AddSoundForm({
  onSuccess,
  deviceID,
}: AddSoundFormProps) {

    const [status, setStatus] = React.useState<AddSoundStatus>("idle")
    const buttonText: Record<AddSoundStatus, string> = {
        idle: "Add Sound",
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
            sound_name:"",
        }
    })

    async function onSubmit(data: z.infer<typeof formSchema>){
      
      const token = getToken();  
        
      if(!token) {
          toast.error("You are not authenticated", {
              position: "top-center",
          })
          return
        }

      if(status==="idle" || status === "failed"){
        setStatus("starting")

        try {
          const response = await fetch(
            `${API_URL}/recording/${deviceID}/start`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if(!response.ok){
            let detail = "Unable to start recording"
            try {
              const errorData = await response.json()
              detail = errorData?.detail ?? detail
            } catch {
              detail = response.statusText || detail
            }
            throw new Error(detail)
          }
          setStatus("recording")
        } catch (error) {
          console.error("Failed to start recording", error)
          toast.error(
            error instanceof Error
            ? error.message
            : "Unable to start recording",
            {
              position: "top-center"
            }
          )
          setStatus("failed")
        }

        return
      }

      if(status !== "naming"){
        return
      }
        
        



        const formData = new FormData()
        formData.append("sound_name", data.sound_name)
        formData.append("device_id", String(deviceID))

        try {

            const res = await fetch(`${API_URL}/sound/register`,{
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if(!res.ok){
                const errorData = await res.json()
                toast.error(`Adding sound failed: ${errorData?.detail || "Unknown error"}`, {
                    position: "top-center",
                })
                setStatus("failed")
                return
            }

            const newSound: Sound = await res.json()

            toast.success("Sound Add Successful", {
                position: "top-center",
            })

            setCreatedSound(newSound)
            setStatus("ready")
            onSuccess?.(newSound)

        } catch (error) {
            console.error("Failed to add sound", error)

            toast.error("Unable to connect to the server.", {
                position: "top-center",
            })

            setStatus("failed")
        }


    } 
 
  return (
    <div className={cn("flex flex-col gap-6")}>
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
                    <FieldLabel htmlFor="sound_name">Sound Name</FieldLabel>
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
                <Button 
                    type="submit" 
                    disabled={
                      form.formState.isSubmitting ||
                      status === "starting" ||
                      status === "recording" ||
                      status === "processing" ||
                      status === "uploading" ||
                      status === "complete"
                    }
                >
                  {buttonText[status]}
                    
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
