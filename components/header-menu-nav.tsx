"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"

export default function HeaderMenuNav(){

    const router = useRouter()
    const pathname = usePathname()

    return(
        <>
            <Button
                variant="ghost"
                size="lg"
                className="w-full"
                disabled={pathname === "/board"}
                onClick={() => router.push("/board")}
            >
                Dashboard
            </Button>
            <Button
                variant="ghost"
                size="lg"
                className="w-full"
                disabled={pathname === "/historique"}
                onClick={() => router.push("/historique")}
            >
                Historique
            </Button>
        </>
    )
}