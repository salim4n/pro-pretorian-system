"use client"

import { useTheme } from "next-themes"
import { SparklesCore } from "../ui/sparkles"

interface IProps {
  minSize: number
  maxSize: number
  particleDensity: number
}

export default function SparklesComponent({
  minSize,
  maxSize,
  particleDensity,
}: IProps) {
  const { theme } = useTheme()

  return (
    <SparklesCore
      id="tsparticlesfullpage"
      background="transparent"
      minSize={minSize}
      maxSize={maxSize}
      particleDensity={particleDensity}
      className="w-full h-full"
      particleColor={theme === "dark" ? "#DAA520" : "#E90BF9"}
    />
  )
}
