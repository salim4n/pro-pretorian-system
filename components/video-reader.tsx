"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface IProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  videoSrc: string | null
}

export default function VideoReader({ videoRef, canvasRef, videoSrc }: IProps) {
  return (
    <Card className="overflow-hidden bg-background">
      <CardHeader className="flex flex-row items-start bg-muted/50 ">
        <div className="grid gap-0.5">
          <CardTitle className="text-lg">Lecteur Vidéo</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-lg aspect-video">
          <video ref={videoRef} className="w-full" autoPlay controls>
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
          </video>
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}
