import { cookies } from "next/headers"
import HeaderClient from "./header-client"

export default async function Header() {
  const isAuth =
    cookies().get("pro-pretorian-session") === undefined ? false : true

  return (
    isAuth && (
      <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background rounded-full mx-auto px-4 md:px-6 lg:px-8 z-20">
        <HeaderClient />
      </header>
    )
  )
}
