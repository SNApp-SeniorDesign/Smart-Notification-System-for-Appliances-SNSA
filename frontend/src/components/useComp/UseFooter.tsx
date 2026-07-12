"use client"

import Link from "next/link"

export function Footer(){
    return(
        <footer>
            <div className="flex items-center gap-4 w-full h-fit">
                <Link href="/">
                    Home
                </Link>
                <Link href="/setting">
                    Setting
                </Link>
            </div>
        </footer>
    )
}