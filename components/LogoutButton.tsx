"use client"

import { logout } from "@/lib/identity/auth"
import { Button } from "./ui/button"

export default function LogoutButton() {
  return (
    <Button
      onClick={async () => {
        await logout()
      }}>
      Se déconnecter
    </Button>
  )
}
