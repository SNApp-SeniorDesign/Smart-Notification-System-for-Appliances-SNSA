"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getToken, clearToken} from "@/lib/auth"


const API_URL = process.env.NEXT_PUBLIC_API_URL

async function handleDeleteAccount() {
    const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
    if(!confirmed) return
    const token = getToken()
    let backendOk = false

    try {
        const res = await fetch (`${API_URL}/users/me`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            }
        })
        backendOk = res.ok
    } catch (error) {
        console.error("Error deleting account:", error)
        }
    if (backendOk){
        toast.success("Account deleted successfully", { position: "top-center"})
    } else{
        toast.error(
            "Failed to delete account. Please try again later.",
            { position: "top-center"}
        )
    }
    clearToken()
}

export function UseDeleteButton(){
    return (
        <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
        </Button>
    )
}