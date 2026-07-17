"use client"

import {Footer} from "@/components/useComp/general/UseFooter"
import {UseDeleteButton} from "@/components/useComp/user/UseDeleteButton"
import {LogOutButton} from "@/components/useComp/user/UseLogOut"


export default function Setting(){
    return(
        <div className="flex w-full h-auto items-center">
            <UseDeleteButton/>
            <LogOutButton/>
            <Footer/>
        </div>
    )
}