"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LogForm } from "@/components/useComp/UseLogForm"

type DialoginProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger?: boolean
  onSwitchToSignup?: () => void
}


export function UseDialLog({
  open,
  onOpenChange,
  showTrigger = true,
  onSwitchToSignup
}: DialoginProps)
{  
  return (
//Dialog component are open
    <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger
          render={
            <Button>
              Log In
            </Button>
          }
        />
        )}
     
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Log in to your Account</DialogTitle>
            <DialogDescription>
                Enter your email and password to log in to your account
            </DialogDescription>
          </DialogHeader>
            <LogForm
              onLoginSuccess={() => onOpenChange(false)}
              onSwitchToSignup={onSwitchToSignup}
            />
        </DialogContent>
    </Dialog>
  )
}   