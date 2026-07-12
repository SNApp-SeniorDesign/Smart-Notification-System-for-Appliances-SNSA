"use client"

import {Footer} from "@/components/useComp/UseFooter"
import {UseDeleteButton} from "@/components/useComp/UseDeleteButton"
import {LogOutButton} from "@/components/useComp/UseLogOut"


export default function Setting(){
    return(
        <div className="flex w-full h-auto items-center">
            <UseDeleteButton/>
            <LogOutButton/>
            <Footer/>
        </div>
    )
}