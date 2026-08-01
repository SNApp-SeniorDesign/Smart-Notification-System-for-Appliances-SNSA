"use client"

import Link from "next/link"
import {UseDialogAddSound} from "@/components/useComp/sound/UseDialogAddSound"


type FooterProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    showTrigger?: boolean
    deviceID: number
    deviceSerialNumber: string
}

export function Footer({
    open,
    onOpenChange,
    showTrigger = true,
    deviceID,
    deviceSerialNumber,
}: FooterProps) {
    return(
        <footer>
            <div className="flex items-center gap-4 w-full h-auto justify-center">
                <Link href="/dashboard">
                    Home
                </Link>
                <Link href="/setting">
                    Setting
                </Link>
                <UseDialogAddSound 
                    deviceID={deviceID} 
                    deviceSerialNumber={deviceSerialNumber}
                    open={open}
                    onOpenChange={onOpenChange}
                    showTrigger={showTrigger}
                />
            </div>
        </footer>
    )
}