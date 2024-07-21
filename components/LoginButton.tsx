"use client"

import { useRouter } from "next/navigation"
import { Button } from "./ui/button"


export default function LoginButton(){
    const router = useRouter()
    return (
        <Button
            onClick={async() => {
                router.push('/login')
            }}
        >
            Se connecter
        </Button>
    )
}