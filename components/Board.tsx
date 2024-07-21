"use client"

import "@tensorflow/tfjs-backend-cpu"
import "@tensorflow/tfjs-backend-webgl"
import { useRef, useEffect, useState } from "react"
import {
  load as cocoSSDLoad,
  type ObjectDetection,
} from "@tensorflow-models/coco-ssd"
import * as tf from "@tensorflow/tfjs"
import Webcam from "react-webcam"
import { Detected, sendPicture } from "@/app/lib/send-detection/action"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card"

export default function Board({ user }) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const webcamRefs = useRef<Webcam[]>([])
  const [net, setNet] = useState<ObjectDetection | null>(null)
  const [cameraChecked, setCameraChecked] = useState<boolean[]>([])
  const [modelLoading, setModelLoading] = useState(true)

  async function runCocoSsd() {
    const loadedNet = await cocoSSDLoad()
    setNet(loadedNet)
    setModelLoading(false)
  }

  async function runObjectDetection(net: ObjectDetection) {
    webcamRefs.current.forEach(async webcam => {
      if (webcam !== null && webcam.video?.readyState === 4) {
        const objectDetected = await net.detect(webcam.video, undefined, 0.5)
        objectDetected.forEach(async o => {
          if (o.class === "person") {
            const body = {
              detected: o,
              picture: webcam.getScreenshot({ width: 640, height: 480 }),
            }
            await sendPicture(body as Detected, user)
          }
        })
      }
    })
  }

  useEffect(() => {
    tf.setBackend("webgl")
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(
          device => device.kind === "videoinput"
        )
        setCameras(videoDevices)
        setCameraChecked(videoDevices.map(() => true))
      })
      .then(() => runCocoSsd())
  }, [])

  useEffect(() => {
    if (net) {
      const detectInterval = setInterval(() => {
        runObjectDetection(net)
      }, 3000)

      return () => {
        clearInterval(detectInterval)
        net?.dispose()
        tf.disposeVariables()
      }
    }
  }, [net])

  if (modelLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
        <Card className="m-3 z-50">
          <CardContent className="m-5">
            <div className="w-full text-center flex justify-center items-center">
              <Avatar className="w-48 h-48">
                <AvatarImage src="/icon.jpeg" />
                <AvatarFallback>PR</AvatarFallback>
              </Avatar>
              <Badge variant="default" className="mt-4">
                <strong className="ml-4">
                  {modelLoading && "Chargement du modèle de reconnaissance"}
                </strong>
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="m-3 w-full lg:col-span-2 flex-grow">
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="w-full h-10" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="w-full h-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
      {cameras.map((camera, index) => (
        <Card key={index} className="flex flex-col items-center mt-5">
          <CardHeader>
            <CardTitle>{camera.label}</CardTitle>
            <CardDescription>
              <div className="flex item-center">
                <Switch
                  id={camera.deviceId}
                  defaultChecked
                  checked={cameraChecked[index]}
                  onCheckedChange={checked => {
                    setCameraChecked(prev =>
                      prev.map((_, i) => (i === index ? checked : _))
                    )
                  }}
                  className="m-1 relative"
                />
                <strong>{cameraChecked[index] ? "On" : "Off"}</strong>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cameraChecked[index] && (
              <Webcam
                audio={false}
                videoConstraints={{
                  deviceId: camera.deviceId,
                }}
                ref={el => {
                  if (el) {
                    webcamRefs.current[index] = el
                  }
                }}
                key={index}
                width={640}
                height={480}
                className="m-1 rounded-md border-gray-500 border-2"
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
