"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { getToken, clearToken} from "@/lib/auth"


const API_URL = process.env.NEXT_PUBLIC_API_URL


export function LogOutButton(){
    
    const router = useRouter()
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
        router.replace("/")
        router.refresh
    }
    
    
    return (
        <Button onClick={handleLogOut}>
            Log-Out
        </Button>
    )
}