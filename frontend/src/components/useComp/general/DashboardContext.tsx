"use client"

import * as React from "react"

type SelectedDevice = {
  id: number
  device_name: string
  serial_number: string
  user_id: number
  device_status: string
  is_paired: boolean
}

type DashboardContextValue = {
  selectedDevice: SelectedDevice | null
  setSelectedDevice: React.Dispatch<
    React.SetStateAction<SelectedDevice | null>
  >
  addSoundDialogOpen: boolean
  setAddSoundDialogOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >
}

const DashboardContext =
  React.createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [selectedDevice, setSelectedDevice] =
    React.useState<SelectedDevice | null>(null)

  const [addSoundDialogOpen, setAddSoundDialogOpen] =
    React.useState(false)

  return (
    <DashboardContext.Provider
      value={{
        selectedDevice,
        setSelectedDevice,
        addSoundDialogOpen,
        setAddSoundDialogOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = React.useContext(DashboardContext)

  if (!context) {
    throw new Error(
      "useDashboardContext must be used inside DashboardProvider"
    )
  }

  return context
}