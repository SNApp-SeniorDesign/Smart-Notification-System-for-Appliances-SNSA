"use client"
import * as React from "react"
import { CollapsibleDeviceMenu } from "@/components/useComp/device/UseDeviceMenu"
import { SoundList } from "@/components/useComp/sound/UseSoundList"
import {type Sound} from "@/components/useComp/sound/UseSoundCard"
import {useDashboardContext} from "@/components/useComp/general/DashboardContext"


export default function Dashboard(){
    const {selectedDevice} = useDashboardContext()
    const [selectedSound, setSelectedSound] = React.useState<Sound | null>(null)
    function handleSoundClick(sound: Sound){
        setSelectedSound(sound)
    }
    return(
        <div>
            <CollapsibleDeviceMenu />
                {selectedDevice ? (
                    <SoundList
                        deviceID={selectedDevice.id}
                        onSoundClick={handleSoundClick}
                    />
                ) : (
                    <p>Select a device to view its sounds.</p>
                )}
        </div>
    )
}