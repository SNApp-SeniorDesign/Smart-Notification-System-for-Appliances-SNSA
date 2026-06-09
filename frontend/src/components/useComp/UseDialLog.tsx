"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogForm } from "@/components/useComp/UseLogForm"
import * as React from "react"
import { useState } from "react"

export function UseDialLog()
{  
  const [open, setOpen] = useState(false)
  return (
//Dialog component are open
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button>
              Log In
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log in to your Account</DialogTitle>
            <DialogDescription>
                Enter your email and password to log in to your account
            </DialogDescription>
          </DialogHeader>
            <LogForm onSuccess={() => setOpen(false)} />
        </DialogContent>
    </Dialog>
  )
}   