"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const buttonClassName = `rounded-full ${theme === "light" ? "bg-blue-300" : "bg-blue-900"} cursor-pointer hover:bg-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors p-1 md:p-2 md:rounded-full md:hover:bg-blue-400`

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button variant="outline" size="icon" className={buttonClassName} onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500"  />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-yellow-500" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}