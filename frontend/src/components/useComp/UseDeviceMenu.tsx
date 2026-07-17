"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { UseDialAddDevice } from "@/components/useComp/UseDialogAddDevice"

export function CollapsibleDeviceMenu() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [DeviceOpen, SetDeviceOpen] = React.useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex w-screen flex-col gap-2 items-center"
    >
      <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm w-screen h-fit">
        <span className="text-muted-foreground">Device Name</span>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="size-8"><ChevronsUpDown /><span className="sr-only">Toggle details</span></Button>} />
      </div>
      <div className="h-fit border w-max rounded-md px-[40%] bg-gray-200">
        <CollapsibleContent className="flex flex-col gap-2">
            <div className="rounded-md px-4 py-2 text-sm">
                <UseDialAddDevice 
                    open={DeviceOpen}
                    onOpenChange = {SetDeviceOpen}
                />
            </div>
      </CollapsibleContent>
      </div>

    </Collapsible>
  )
}
