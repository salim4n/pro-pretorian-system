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
import { UserView } from "@/lib/identity/definition"
import { useEffect, useState, useRef } from "react"
import { ModelComputerVision, ModelList, modelList } from "@/models/model-list"
import { cocossdVideoInference } from "@/lib/cocossd/detect"
import { detectVideo } from "@/lib/yolov8n/detect"
import ModelLoader from "./model-loader"
import { segmentVideo } from "@/lib/yolov8n-seg/detect"

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const [coco, setCoco] = useState<ObjectDetection | null>(null) // init model of COCO SSD
  const [yolo, setYolo] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }) // init model & input shape of YOLO DETECTION
  const [yoloSeg, setYoloSeg] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }) // init model & input shape of YOLO SEGMENTATION
  const [modelName, setModelName] = useState<string>("")
  const [loadModel, setLoadModel] = useState<boolean>(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [percentLoaded, setPercentLoaded] = useState<number>(0)

  useEffect(() => {
    tf.setBackend("webgl")

    return () => {
      tf.disposeVariables()
      tf.dispose()
    }
  }, [])

  useEffect(() => {
    tf.getBackend() !== "webgl" && tf.setBackend("webgl")
    tf.ready().then(() => {
      console.log("model", modelName)
      if (modelName === ModelComputerVision.COCO_SSD) {
        yolo?.net?.dispose()
        setLoadModel(true)
        load()
          .then(loadedModel => setCoco(loadedModel))
          .catch(err => console.error(err))
          .finally(() => setLoadModel(false))
      }

      if (modelName === ModelComputerVision.DETECTION) {
        coco?.dispose()
        setLoadModel(true)
        setCoco(null)
        tf.ready().then(async () => {
          const yolov8 = await tf.loadGraphModel(
            modelList.find(
              model => model.title === ModelComputerVision.DETECTION
            )?.url as string,
            {
              onProgress: fractions => {
                setPercentLoaded(fractions * 100)
              },
            }
          ) // load model

          // warming up model
          const dummyInput = tf.ones(yolov8.inputs[0].shape)
          const warmupResults = yolov8.execute(dummyInput)

          setYolo({
            net: yolov8,
            inputShape: yolov8.inputs[0].shape,
          }) // set model & input shape

          tf.dispose([warmupResults, dummyInput]) // cleanup memory
          setLoadModel(false)
        })
      }
      if (modelName === ModelComputerVision.SEGMENTATION) {
        coco?.dispose()
        yolo?.net?.dispose()
        setLoadModel(true)
        tf.ready().then(async () => {
          const yolov8 = await tf.loadGraphModel(
            modelList.find(
              model => model.title === ModelComputerVision.SEGMENTATION
            )?.url as string,
            {
              onProgress: fractions => {
                setPercentLoaded(fractions * 100)
              },
            }
          ) // load model

          // warming up model
          const dummyInput = tf.randomUniform(
            yolov8.inputs[0].shape,
            0,
            1,
            "float32"
          ) // random input
          const warmupResults = yolov8.execute(dummyInput)

          setYoloSeg(prevState => ({
            ...prevState,
            net: yolov8,
            inputShape: yolov8.inputs[0].shape,
            outputShape: (warmupResults as any).map(e => e.shape),
          })) // set model & input shape

          tf.dispose([warmupResults, dummyInput]) // cleanup memory
          setLoadModel(false)
        })
      }
    })
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
      cocossdVideoInference(coco, videoRef, canvasRef)
    } else if (modelName === ModelComputerVision.DETECTION) {
      detectVideo(videoRef.current, yolo, canvasRef)
    } else if (modelName === ModelComputerVision.SEGMENTATION) {
      segmentVideo(videoRef.current, yoloSeg as any, canvasRef.current)
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
          <ModelLoader
            percent={percentLoaded}
            model={
              modelList.find(model => model.title === modelName) as ModelList
            }
          />
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
