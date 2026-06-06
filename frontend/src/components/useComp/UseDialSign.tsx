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
import { SignForm } from "@/components/useComp/UseSignForm"
import * as React from "react"

export function UseDialSign()
{  return (
//Dialog component are open
    <Dialog>
        <DialogTrigger
          render={
            <Button>
              Sign Up
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create your Account</DialogTitle>
            <DialogDescription>
                Enter your email, username, and password to create an account
            </DialogDescription>
          </DialogHeader>
            <SignForm />
        </DialogContent>
    </Dialog>
  )
}   