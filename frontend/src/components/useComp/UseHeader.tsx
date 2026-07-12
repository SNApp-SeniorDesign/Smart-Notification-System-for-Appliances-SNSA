"use client";

import Link from "next/link"
import { usePathname} from 'next/navigation'
import { UseDialSign } from "@/components/useComp/UseDialSign";
import {UseDeleteButton} from "@/components/useComp/UseDeleteButton"
import {UseDialLog} from "@/components/useComp/UseDialLog"
import {LogOutButton} from "@/components/useComp/UseLogOut"
import {getToken} from "@/lib/auth"
import {Button} from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"

const AUTH_NAV = [
    {label: "Dashboard", href:"/dashboard"}
] as const;

export function Header(){
    const pathname = usePathname()

    const [registerOpen, setRegisterOpen] = React.useState(false)
    const [loginOpen, setLoginOpen] = React.useState(false)

    const [isLoggedIn, setIsLoggedIn] = React.useState(false)

    React.useEffect(() => {
        const sync = () => setIsLoggedIn(!!getToken())
        sync()
        window.addEventListener("storage", sync)
    }, [pathname])
    
    React.useEffect(() => {
        const onOpenSignup = () => setRegisterOpen(true)
        const onOpenLogin = () => setLoginOpen(true)
        window.addEventListener("open-signup", onOpenSignup)
        window.addEventListener("open-login", onOpenLogin)
        return () => {
            window.removeEventListener("open-signup", onOpenSignup)
            window.removeEventListener("open-login", onOpenLogin)
        }
    }, [])

    if(pathname === '/'){
        return (
            <header className="w-full h-fit">
                <div className="w-full h-fit items-center gap-4 sm: grid sm:items-center sm:gap-4">
                    <Link
                        href="/"
                        aria-label="Go to welcome page"
                        className={cn(
                            "group inline-flex items-center gap-2 "
                        )}
                    >Home
                    </Link>
                    {isLoggedIn && (
                        <nav
                            className={cn(
                                "hidden md:flex items-center gap-1",
                                "sm:col-start-2 sm:justify-self-center"
                            )}
                            aria-label="Primary"
                        >
                            {AUTH_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-medium"
                                >
                                    {item.label}
                                </Link>
                            ))}

                        </nav>
                    )}
                    <div 
                        className={cn(
                            "flex items-center gap-2 sm:col-start-3 sm:justify-self-end"
                        )}
                    >
                    
                    {isLoggedIn? (
                        <UseDeleteButton/>
                    ): (
                        <>
                            <UseDialLog
                                open={loginOpen}
                                onOpenChange={setLoginOpen}
                                onSwitchToSignup={() => {
                                    setLoginOpen(false)
                                    setRegisterOpen(true)
                                }}
                            />
                            <UseDialSign
                                open={registerOpen}
                                onOpenChange={setRegisterOpen}


                                onRegisterSuccess={() => {
                                    setRegisterOpen(false)
                                    setLoginOpen(true)
                                }}

                                onAutoLoginSuccess={() => setRegisterOpen(false)}
                            />
                        </>
                    )
                    
                } 
                    </div>
                </div>
            </header>
        )
    }
    else {
        return(
            <header className="w-full h-fit">
                <div className="w-full h-fit flex flex-col items-center gap-4 sm:grid sm:grid-cols-3 sm:items-center sm: gap:4">
                    <Link
                        href="/"
                        aria-label="Go to landing page"
                        className={cn(
                            "group inline-flex items-center gap-2",
                            "sm:col-start-1 sm:justify-self-start"
                        )}
                    > Home
                    </Link>
                    <nav
                        className={cn(
                            "hidden md:flex items-center gap-1",
                            "sm: col-start-2 sm: justify-self-center"
                        )}
                        aria-label="Primary"
                    >
                        {AUTH_NAV.map((item) => {
                            const active = pathname === item.href || pathname?.startsWith(item.href + "/")
                            return(
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aira-current={active ? "page" : undefined}
                                    className={cn(
                                        "text-sm font-medium",
                                        active?"text-primary":"text-gray-700"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}

                    </nav>
                    <div
                        className = {cn(
                            "flex items-center gap-2",
                            "sm:col-start-3 sm:justify-self-end"
                        )}
                    >
                        {isLoggedIn && (
                            <LogOutButton/>
                        )}

                    </div>
                </div>
            </header>
        )
    }
}