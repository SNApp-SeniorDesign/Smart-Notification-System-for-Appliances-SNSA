"use client"

import Link from "next/link"
import {usePathname } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useDashboardContext } from "@/components/useComp/general/DashboardContext"
import {UseDialogAddSound} from "@/components/useComp/sound/UseDialogAddSound"

import { House, Plus, Settings } from 'lucide-react'


export function Footer() {
  const pathname = usePathname()

  const {
    selectedDevice,
    addSoundDialogOpen,
    setAddSoundDialogOpen,
  } = useDashboardContext()

  const showAddSoundButton = pathname === "/dashboard"

  function handleOpenAddSound() {
    if (!selectedDevice) {
      toast.error(
        "Select an SNSA device before adding a sound",
        {
          position: "top-center",
        }
      )

      return
    }

    setAddSoundDialogOpen(true)
  }

  return (
    <footer>
      <div className="flex items-center gap-4 w-full h-auto justify-center">
        <Link href="/dashboard" aria-label="Home">
        < House className="size-[clamp(3rem,4vw,4rem)] hover:text-primary" />
        </Link>

        {showAddSoundButton && (
          <Button
            type="button"
            onClick={handleOpenAddSound}
            aria-label="Add sound"
            className="size-[clamp(3rem,4vw,4rem)] p-2"
          >
            <Plus className="size-[clamp(3rem,4vw,4rem)]" />
          </Button>
        )}


        <Link href="/setting" aria-label="Settings">
          <Settings className="size-[clamp(3rem,4vw,4rem)] hover:text-primary" />
        </Link>

        {showAddSoundButton && selectedDevice && (
          <UseDialogAddSound
            deviceID={selectedDevice.id}
            deviceSerialNumber={
              selectedDevice.serial_number
            }
            open={addSoundDialogOpen}
            onOpenChange={setAddSoundDialogOpen}
            showTrigger={false}
          />
        )}
      </div>
    </footer>
  )
}