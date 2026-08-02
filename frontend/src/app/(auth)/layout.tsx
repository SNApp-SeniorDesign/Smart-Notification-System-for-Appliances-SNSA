"use client"

import {useState, useEffect} from "react"
import {useRouter} from "next/navigation"
import {getToken, clearToken} from "@/lib/auth"
import { Header } from "@/components/useComp/general/UseHeader";
import {Footer} from "@/components/useComp/general/UseFooter"
import { DashboardProvider } from "@/components/useComp/general/DashboardContext";

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
                setLoading(false)
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
            } catch {
                clearToken()
                router.replace("/")
            } finally{
                setLoading(false)
            }
            

        } 
        checkAuth()
    }, [router])

    if(loading){
        return <div>Checking authenticate....</div>
    }

    if(!isAuthenticate){
        return null
    }

    return( 
        <>
            <DashboardProvider>
                <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer/>
                </div>
            </DashboardProvider>
        </>
    )
}