"use client"

import * as React from "react"
import { toast } from "sonner"

import { getToken } from "@/lib/auth"

import {
    SoundCard,
    type Sound,
} from "@/components/useComp/sound/UseSoundCard"

const API_URL = process.env.NEXT_PUBLIC_API_URL

type SoundListProps = {
    deviceID: number
    onSoundClick: (sound: Sound) => void
}

export function SoundList({
    deviceID,
    onSoundClick,
}: SoundListProps){
    const [sounds, setSounds] = React.useState<Sound[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchSound(){
            const token = getToken()
            if (!token) {
                toast.error("No token found")
                setLoading(false)
                return
            }

            if(!API_URL){
                toast.error("API URL is not configured")
                setLoading(false)
                return
            }

            try {
                const response = await fetch(
                    `${API_URL}/sound/${deviceID}/all`,
                    {
                        headers:{
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        }
                    }
                )

                if(!response.ok){
                    throw new Error("Unable to load sounds")
                }

                const data: Sound[] = await response.json()
                setSounds(data)
            } catch (error) {
                console.error("Failed to load sounds", error)
                toast.error("Unable to load sounds")
            } finally {
                setLoading(false)
            }
        }
        void fetchSound()
    }, [deviceID])

    if(loading) {
        return <p>Loading sounds...</p>
    }

    if (sounds.length === 0) {
        return <p> No sounds have been added yet.</p>
    }

    return (
        <div className="grid gap-4 sm: gris-cols-2 lg:grid-cols-3">
            {sounds.map((sound) => (
                <SoundCard
                    key={sound.id}
                    sound={sound}
                    onClick={() => onSoundClick(sound)}
                />
            ))}
        </div>
    )
}