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
import { SignForm } from "@/components/useComp/UseSignForm"

type DialogSigninProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  onRegisterSuccess?: () => void

  onAutoLoginSuccess? : () => void
}

export function UseDialSign({
  open,
  onOpenChange,
  onRegisterSuccess,
  onAutoLoginSuccess
}: DialogSigninProps)
{  
  return (
//Dialog component are open
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger
          render={
            <Button>
              Sign Up
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create your SNSA Account</DialogTitle>
            <DialogDescription>
                Enter your email, username, and password to create an account
            </DialogDescription>
          </DialogHeader>
            <SignForm
              onRegisterSuccess={onRegisterSuccess}
              onAutoLoginSuccess={onAutoLoginSuccess}
            />
        </DialogContent>
    </Dialog>
  )
}   