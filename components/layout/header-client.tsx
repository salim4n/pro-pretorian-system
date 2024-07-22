"use client"

import { MenuSquareIcon } from "lucide-react"
import HeaderMenuNav from "../header-menu-nav"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { ModeToggle } from "../mode-toggle"
import HeaderDropdown from "./header-dropdown"

export default function HeaderClient() {
  return (
    <>
      <div className="flex items-center gap-4">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <HeaderMenuNav />
        </nav>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <MenuSquareIcon className="h-full w-full" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <HeaderMenuNav />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-4 ml-auto">
        <HeaderDropdown />
        <ModeToggle />
      </div>
    </>
  )
}
