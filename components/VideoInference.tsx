"use client"

import "@tensorflow/tfjs-backend-webgl"
import * as tf from "@tensorflow/tfjs"
import { ObjectDetection, load } from "@tensorflow-models/coco-ssd"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { UserView } from "@/app/lib/identity/definition"
import { useEffect, useState, useRef } from "react"
import { ModelComputerVision } from "@/models/model-list"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const [model, setModel] = useState<ObjectDetection | null>(null)
  const [modelName, setModelName] = useState<string>("")
  const [loadModel, setLoadModel] = useState<boolean>(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    tf.setBackend("webgl")

    return () => {
      tf.disposeVariables()
      tf.dispose()
    }
  }, [])

  useEffect(() => {
    console.log("model", modelName)
    if (modelName === ModelComputerVision.COCO_SSD) {
      setLoadModel(true)
      load()
        .then(loadedModel => setModel(loadedModel))
        .catch(err => console.error(err))
        .finally(() => setLoadModel(false))
    }
  }, [modelName])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)
    }
  }

  const handleCreateVideoWithBoundingBox = () => {
    if (model && videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const drawBoundingBoxes = async () => {
        if (video.paused || video.ended) {
          return
        }
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
          const predictions = await model.detect(video)

          predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox
            context.strokeStyle = "#00FFFF"
            context.lineWidth = 2
            context.strokeRect(x, y, width, height)
            context.font = "16px sans-serif"
            context.fillStyle = "#00FFFF"
            context.fillText(
              `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
              x,
              y > 10 ? y - 5 : 10
            )
          })
        }
        requestAnimationFrame(drawBoundingBoxes)
      }

      video.addEventListener("play", drawBoundingBoxes)
    }
  }

  return (
    <div className="m-5 flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"></header>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden bg-background">
            <CardHeader className="flex flex-row items-start bg-muted/50 ">
              <div className="grid gap-0.5">
                <CardTitle className="text-lg">Video Preview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative w-full max-w-2xl overflow-hidden rounded-lg aspect-video">
                <video ref={videoRef} className="w-full" controls>
                  {videoSrc && <source src={videoSrc} type="video/mp4" />}
                </video>
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card className="bg-background">
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="text-lg">Upload Video</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                <Input
                  type="file"
                  accept="video/*"
                  placeholder="Choose a video file"
                  className="bg-background"
                  onChange={handleFileChange}
                />
                <Button
                  onClick={handleCreateVideoWithBoundingBox}
                  disabled={!model || !videoSrc}>
                  Traiter la vidéo
                </Button>
              </div>
            </CardContent>
          </Card>
          {loadModel ? (
            <Card className="bg-background">
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="text-lg">Loading Model</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full text-center flex justify-center items-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/icon.jpeg" />
                    <AvatarFallback>PR</AvatarFallback>
                  </Avatar>
                  <Badge variant="default" className="mt-4">
                    <strong className="ml-4">
                      {loadModel && "Loading Object Detection Model"}
                    </strong>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="text-lg">Select Model</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between">
                        <span>
                          {model ? modelName : "Choisissez un modèle"}
                        </span>
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {Object.keys(ModelComputerVision).map((key, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={() =>
                            setModelName(ModelComputerVision[key])
                          }>
                          {ModelComputerVision[key]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-start bg-muted/50">
              <div className="grid gap-0.5">
                <CardTitle className="text-lg">Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                <Button disabled={!model || !videoSrc}>
                  Download Processed Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ChevronDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function PlayIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  )
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
