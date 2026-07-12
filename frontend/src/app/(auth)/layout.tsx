"use client"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {getToken, clearToken} from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthLayout({children}: {children: React.ReactNode}){
    const [loading, setLoading] = useState(true)
    const [isAuthenticate, setIsAuthenticated] = useState(false)

    const router = useRouter()

    useEffect(() => {
        async function checkAuth(){
            const token = getToken()

            if(!token){
                router.replace("/")
                return
            }

            try {
                const res = await fetch(`${API_URL}/users/me`,{
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    },
                })

                if(!res.ok){
                    clearToken()
                    router.replace("/")
                    return
                }
                setIsAuthenticated(true)
            } catch (error){
                clearToken()
                router.replace("/")
            } finally{
                setLoading(false)
            }
            checkAuth()
        } 
    }, [router])

    if(loading){
        return <div>Checking authenticate....</div>
    }

    if(!isAuthenticate){
        return null
    }

    return <>(children)</>
}