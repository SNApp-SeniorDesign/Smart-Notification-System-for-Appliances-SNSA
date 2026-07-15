"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function UseAddDevice(){

    async function HandleAddDevice(){
        const token = getToken()
        
        try {
            const res = await fetch(`${API_URL}/device`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                })
            
            if(!res.ok){
                toast.error("Failed to Add Device. Please try again later.", {
                    position: "top-center",
                })
                return
            }

            toast.success("Device successfully Add", {
                position: "top-center",
            })

        } catch {
            toast.error("Failed to Add Device. Please try again later.", {
                    position: "top-center",
                })
        }

    }

    return (
        <Button onClick={HandleAddDevice}>
            Add Device
        </Button>
    )

}