"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getToken, clearToken} from "@/lib/auth"


const API_URL = process.env.NEXT_PUBLIC_API_URL

async function handleLogOut() {
    const token = getToken()

    try {
        const res = await fetch(`${API_URL}/users/logout`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            }
        })
        if (res.ok) {
            toast.success("Log Out Successfully", {position: "top-center"})
        } else {
            toast.message("Logged out", { position: "top-center"})
        }
    } catch {
        toast.message("Logged out", { position: "top-center"})
    }
    clearToken()
    window.location.href = "/"
}

export function LogOutButton(){
    return (
        <Button onClick={handleLogOut}>
            Log-Out
        </Button>
    )
}