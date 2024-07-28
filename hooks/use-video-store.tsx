import { useRef, useState } from "react"

type VideoStore = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  videoSrc: string | null
  setVideoSrc: (videoSrc: string | null) => void
}

export const useVideoStore = (): VideoStore => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>("")

  return {
    canvasRef,
    videoRef,
    videoSrc,
    setVideoSrc,
  }
}
