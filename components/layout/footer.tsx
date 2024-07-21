"use client"

export default function Footer() {
  return (
    <footer className="mt-auto bg-background h-16 flex items-center justify-center">
      <div className="flex items-center gap-4 text-center">
        <p>{new Date().getFullYear()} &copy; Pretorian System</p>
        <img
          src="/ignitionAI.jpg"
          width="30"
          height="30"
          alt="Presentation"
          className="rounded-full object-cover"
        />
      </div>
    </footer>
  )
}
