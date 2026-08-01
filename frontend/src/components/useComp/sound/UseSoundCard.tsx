"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export type Sound = {
    id: number
    device_id: number
    sound_name: string
    sound_file_url: string
    sound_status: string
    is_synced_to_device: boolean
    profile_version: number
    is_on: boolean
}

type SoundCardProps = {
    sound: Sound
    onClick: (sound: Sound) => void
}

export function SoundCard({
    sound,
    onClick,
}: SoundCardProps) {
    return (
        <Card
            role="button"
            tabIndex={0}
            className="cursor-pointer transition hover: bg-muted"
            onClick={() => onClick(sound)}
            onKeyDown={(event) => {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault()
                    onClick(sound)
                }
            }}
        >
            <CardHeader>
                <CardTitle>{sound.sound_name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <p>
                    Status: {sound.sound_status}
                </p>
                <p>
                    Enable: {sound.is_on ? "Yes" : "No"}
                </p>
                <p>
                    Device sync: {" "}
                    {sound.is_synced_to_device 
                        ? "Synced"
                        : "Not synced"}
                </p>
            </CardContent>
        </Card>

    )
}