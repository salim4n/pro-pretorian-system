"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "./ui/button"

export default function HeaderMenuNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <div className="flex items-center gap-4"></div>
      <Button
        variant="ghost"
        size="lg"
        className="w-full "
        disabled={pathname === "/"}
        onClick={() => router.push("/")}>
        Dashboard
      </Button>
      <Button
        variant="ghost"
        size="lg"
        className="w-full "
        disabled={pathname === "/historique"}
        onClick={() => router.push("/historique")}>
        Historique
      </Button>
    </>
  )
}
