"use client"
import * as React from "react"
import { CollapsibleDeviceMenu } from "@/components/useComp/device/UseDeviceMenu"
import { SoundList } from "@/components/useComp/sound/UseSoundList"
import {type Sound} from "@/components/useComp/sound/UseSoundCard"
import {useDashboardContext} from "@/components/useComp/general/DashboardContext"
import { DialogSoundForm } from "@/components/useComp/sound/UseDialogSoundMenu"
import { ZodNull } from "zod/v3"

export default function Dashboard(){
    const {selectedDevice} = useDashboardContext()
    const [selectedSound, setSelectedSound] = React.useState<Sound | null>(null)
    const [soundDialogOpen, setSoundDialogOpen] = React.useState(false)
    const [soundRefreshKey, setSoundRefreshKey] = React.useState(0)
    function handleSoundClick(sound: Sound){
        setSelectedSound(sound)
        setSoundDialogOpen(true)
    }
    return(
        <div>
            <CollapsibleDeviceMenu />
            <DialogSoundForm 
                open={soundDialogOpen}
                onOpenChange={(open) => {setSoundDialogOpen(open)
                    if(!open){
                        setSelectedSound(null)
                    }
                }}
                sound={selectedSound}
                onDeleteSuccess={() => {
                    setSoundRefreshKey((current) => current + 1)
                    setSelectedSound(null)
                }}
            />
                {selectedDevice ? (
                    <SoundList
                        deviceID={selectedDevice.id}
                        onSoundClick={handleSoundClick}
                        refreshKey={soundRefreshKey}
                    />
                ) : (
                    <p>Select a device to view its sounds.</p>
                )}
        </div>
    )
}