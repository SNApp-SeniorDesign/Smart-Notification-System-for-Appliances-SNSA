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
import { toast } from "sonner"
import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

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
    const [isDeleting, setIsDeleting] = React.useState(false)
    React.useEffect(() => {
        if (sound) {
            setSoundName(sound.sound_name)
        }
    }, [sound])

    if (!sound) {
        return null
    }


    async function handDeleteSound(){
        if (!sound || isDeleting){
            return
        }

        const token = getToken()

        if(!token){
            toast.error("You are not authenticated", {
                position: "top-center",
            })
            return
        }

        if(!API_URL){
            toast.error("API URL is not configured",{
                position: "top-center",
            })
            return
        }

        setIsDeleting(true)

        try{
            const response = await fetch(
                `${API_URL}/sounds/${sound.id}/delete`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if(!response.ok){
                let detail = "Unable to delete sound"
            
                try {
                const errorData = await response.json()
                detail = errorData?.detail ?? detail
                } catch {
                    detail = response.statusText || detail
                }

                throw new Error(detail)
            }

            toast.success("Sound deleted successfully", {
                position: "top-center",
            })

            onDeleteSuccess(sound.id)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to delete sound", error)

            toast.error(error instanceof Error
                ? error.message
                : "Unable to delete sound", {
                    position: "top-center"
                }
            )
        } finally {
            setIsDeleting(false)
        }
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
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handDeleteSound}
                            disabled={isDeleting}
                        >
                            Delete Sound
                        </Button>
                    </Field>
                </FieldGroup>
            </DialogContent>
        </Dialog>
    )
}