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
        < House size={30} />
        </Link>



        {showAddSoundButton && (
          <Button
            type="button"
            onClick={handleOpenAddSound}
            aria-label="Add sound"
          >
            <Plus />
          </Button>
        )}


        <Link href="/setting" aria-label="Settings">
          <Settings />
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