"use client"

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  videoSrc: string | null
}

export default function VideoReader({ videoRef, canvasRef, videoSrc }: IProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg aspect-video">
      <video ref={videoRef} className="w-full" controls>
        {videoSrc && <source src={videoSrc} type="video/mp4" />}
      </video>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  )
}
