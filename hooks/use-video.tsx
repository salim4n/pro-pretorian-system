import { MutableRefObject, useRef, useState } from "react"

type VideoStore = {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>
  videoRef: MutableRefObject<HTMLVideoElement | null>
  videoSrc: string | null
  setVideoSrc: (videoSrc: string | null) => void
}

export const useVideo = (): VideoStore => {
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
