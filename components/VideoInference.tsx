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
import { set } from "date-fns"
import { cocossdVideoInference } from "@/app/lib/cocossd/detect"
import { detectVideo } from "@/app/lib/yolov8n/detect"

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const [model, setModel] = useState<ObjectDetection | null>(null)
  const [yolo, setYolo] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }) // init model & input shape
  const [loading, setLoading] = useState({ loading: true }) // loading state
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
      yolo?.net?.dispose()
      setLoadModel(true)
      load()
        .then(loadedModel => setModel(loadedModel))
        .catch(err => console.error(err))
        .finally(() => setLoadModel(false))
    }

    if (modelName === ModelComputerVision.YOLOV8N) {
      model?.dispose()
      setLoadModel(true)
      setModel(null)
      tf.ready().then(async () => {
        const yolov8 = await tf.loadGraphModel(
          `https://huggingface.co/salim4n/yolov8n_web_model/resolve/main/model.json`,
          {
            onProgress: fractions => {
              setLoading({ loading: true }) // set loading fractions
              console.log(`Loading YOLOv8n: ${fractions * 100}%`)
            },
          }
        ) // load model

        // warming up model
        const dummyInput = tf.ones(yolov8.inputs[0].shape)
        const warmupResults = yolov8.execute(dummyInput)

        setLoading({ loading: false })
        setYolo({
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
        }) // set model & input shape

        tf.dispose([warmupResults, dummyInput]) // cleanup memory
        setLoadModel(false)
      })
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
    if (modelName === ModelComputerVision.COCO_SSD) {
      cocossdVideoInference(model, videoRef, canvasRef)
    } else if (modelName === ModelComputerVision.YOLOV8N) {
      detectVideo(videoRef.current, yolo, canvasRef)
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 m-10">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden bg-background">
          <CardHeader className="flex flex-row items-start bg-muted/50 ">
            <div className="grid gap-0.5">
              <CardTitle className="text-lg">Lecteur Vidéo</CardTitle>
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
                className="w-full">
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
                  }
                }}
                disabled={!videoSrc}>
                Vider le lecteur vidéo
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
                <CardTitle className="text-lg">Modèle Sélection</CardTitle>
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
                        {modelName ? modelName : "Choisissez un modèle"}
                      </span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {Object.keys(ModelComputerVision).map((key, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => setModelName(ModelComputerVision[key])}>
                        {ModelComputerVision[key]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
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
