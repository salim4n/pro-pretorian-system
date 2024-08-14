"use client"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="mt-auto bg-background h-16 flex items-center justify-center">
      <div className="flex items-center gap-4 text-center">
        <p className="font-bold">
          {new Date().getFullYear()} &copy; <em>Pretorian System</em>
        </p>
        <Image
          src="/ignitionAI.png"
          width="40"
          height="40"
          alt="Presentation"
          className="rounded-full object-cover"
        />
      </div>
    </footer>
  )
}
