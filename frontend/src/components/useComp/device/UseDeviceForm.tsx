"use client"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    FieldGroup,
} from "@/components/ui/field"

import { AlertDialogDeviceDelete } from "./UseDialogDeleteDevice"

type DeviceFormProps = {
    deviceID: number
    onDeleteSuccess: () => void
}

export function DeviceForm({
    deviceID,
    onDeleteSuccess,
}: DeviceFormProps) {
    //function to handle form submission

    return (
        <div className={cn("flex flex-col gap-6")}>
            {/* eyebrow + heading mirror the dashboard's welcome block */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-slate-300">
                    Settings
                </p>
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
                <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Device Profile
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-slate-400">
                        Change your device name.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
    
                    <form id="Device-form">
                        <div className="flex flex-col gap-6">
                            <FieldGroup className="flex-col gap-4 sm:flex-row">
                                {/* device name */}
                                <span> Placeholder for change device name</span>
                            </FieldGroup>

                            {/* action row — primary save, ghost log-out, destructive delete */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button type="button">
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