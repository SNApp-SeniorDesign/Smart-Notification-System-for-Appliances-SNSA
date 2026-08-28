"use client"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent
} from "@/components/ui/card"
import {
    Field,
    FieldLabel,
    FieldError,
    FieldGroup,
} from "@/components/ui/field"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { getToken } from "@/lib/auth"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

import { AlertDialogDeviceDelete } from "./UseDialogDeleteDevice"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type DeviceFormProps = {
    deviceID: number
    onDeleteSuccess: () => void
}

const formSchema = z.object({
    new_device_name: z.string()
                .trim()
                .optional()
                .or(z.literal("")),
})

export function DeviceForm({
    deviceID,
    onDeleteSuccess,
}: DeviceFormProps) {
    //function to handle form submission
    const form = useForm<z.infer<typeof formSchema>> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            new_device_name:"",
        }
    })

    async function onSubmit(data: z.infer<typeof formSchema>){
        const token = getToken()

        if(!token){
            toast.error("You are not authenticated", {
                position: "top-center"
            })
            return
        }

        if(!API_URL){
            toast.error("API is not configured", {
                position: "top-center",
            })
            return
        }


        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key, value]) => {
                const fieldState = form.getFieldState(key as keyof z.infer<typeof formSchema>)
                return fieldState.isDirty && value !=""
            })
        )

        if(Object.keys(filteredData).length === 0){
            toast.error("no changes to save")
            return
        }

        const res = await fetch(`${API_URL}/device/${deviceID}/update`,{
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
            toast.error(`Updating failed: ${errorData?.message || "Unkown error"}`, {
                position: "top-center",
            })
            return
        }
        const returnedData = await res.json()

        toast.success("Device Name updated successfully", {
            position: "top-center"
        })

        form.reset({
            new_device_name:"",
        })

        return returnedData
    }


    return (
        <div className={cn("flex flex-col gap-6")}>
            {/* eyebrow + heading mirror the dashboard's welcome block */}
            <div>
                <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl dark:text-white">
                    Device Settings
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                    Manage your device and preference
                </p>
            </div>

            {/* glass card matching dashboard / detail pages */}
            <Card
                className={cn(
                    "gap-6 rounded-2xl p-2 ring-0",
                    "border border-foreground/10 bg-white/70 backdrop-blur-md",
                    "dark:border-white/10 dark:bg-white/[0.03]"
                )}
            >
                <CardContent className="flex flex-col gap-6">
    
                    <form id="Device-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <FieldGroup className="flex-col gap-4 sm:flex-row">
                                <Controller 
                                    name="new_device_name"
                                    control={form.control}
                                    render={({ field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="new_device_name" className="text-gray-700 dark:text-slate-200">
                                                New Device Name
                                            </FieldLabel>

                                            <Input 
                                                {...field}
                                                id="new_device_name"
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

                            {/* action row — primary save, ghost log-out, destructive delete */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button type="submit">
                                    Change Device Name
                                </Button>

                                <AlertDialogDeviceDelete 
                                    deviceID={deviceID}
                                    onDeleteSuccess={onDeleteSuccess}
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}