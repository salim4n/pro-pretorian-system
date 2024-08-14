"use client"

import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { useModelStore } from "@/lib/store/model-store"

interface IProps {
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleCreateVideoWithBoundingBox: () => void
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  videoSrc: string | null
  setVideoSrc: (videoSrc: string | null) => void
}

export default function VideoSelect({
  handleFileChange,
  handleCreateVideoWithBoundingBox,
  videoRef,
  canvasRef,
  videoSrc,
  setVideoSrc,
}: IProps) {
  const { modelName } = useModelStore()
  return (
    <Card className="bg-background">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="text-lg">Vidéo Sélection</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          <Input
            type="file"
            id="inputFile"
            accept="video/*"
            placeholder="Choose a video file"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <Button
            variant="outline"
            onClick={handleCreateVideoWithBoundingBox}
            disabled={!modelName || !videoSrc}
            className="w-full cursor-pointer">
            Traiter la vidéo
          </Button>
          <Button
            variant="destructive"
            className="hover:bg-red-500"
            onClick={() => {
              setVideoSrc(null)
              const inputFile = document.getElementById("inputFile")
              if (inputFile) {
                inputFile.setAttribute("value", "")
              }
              if (videoRef.current) {
                videoRef.current.load()
              }

              if (canvasRef.current) {
                const context = canvasRef.current.getContext("2d")
                if (context) {
                  context.clearRect(
                    0,
                    0,
                    canvasRef.current.width,
                    canvasRef.current.height
                  )
                }
                //remove canvas
                canvasRef.current.width = 0
                canvasRef.current.height = 0
              }
            }}
            disabled={!videoSrc}>
            Vider le lecteur vidéo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
