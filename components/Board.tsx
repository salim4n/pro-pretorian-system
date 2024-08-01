"use client"

import { type ObjectDetection } from "@tensorflow-models/coco-ssd"
import { Detected, sendPicture } from "@/lib/send-detection/action"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import useCocoSsd from "@/hooks/use-cocossd"
import ModelSelection from "./model-selection"
import ModelLoader from "./model-loader"
import { ModelComputerVision, modelList } from "@/models/model-list"
import CameraCard from "./camera-card"
import useBoardDetection from "@/hooks/use-board-detection"
import useCamerasConfig from "@/hooks/use-cameras-config"
import {
  CameraStored,
  getCameraByDeviceId,
} from "@/lib/data/local-storage/camera-store"
import { DetectedObject } from "@/lib/identity/definition"
import Webcam from "react-webcam"

export default function Board({ user }) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const { cocoSsd, loadCoco } = useCocoSsd({ ready })
  const { webcamRefs, cameras } = useCamerasConfig()
  useBoardDetection({
    ready,
    net: cocoSsd,
    runObjectDetection,
  })

  function isDetectionInZone(
    detection,
    zone,
    videoWidth,
    videoHeight,
    canvasWidth,
    canvasHeight
  ) {
    const [x, y, width, height] = detection
    const { x: zoneX, y: zoneY, width: zoneWidth, height: zoneHeight } = zone

    const xRatio = canvasWidth / videoWidth
    const yRatio = canvasHeight / videoHeight

    const canvasX = x * xRatio
    const canvasY = y * yRatio
    const canvasDetectionWidth = width * xRatio
    const canvasDetectionHeight = height * yRatio

    return (
      canvasX >= zoneX &&
      canvasY >= zoneY &&
      canvasX + canvasDetectionWidth <= zoneX + zoneWidth &&
      canvasY + canvasDetectionHeight <= zoneY + zoneHeight
    )
  }

  async function ifHaveDetectionZone(
    cameraStorage: CameraStored,
    o: DetectedObject,
    webcam: Webcam
  ) {
    const isIn = isDetectionInZone(
      o.bbox,
      cameraStorage.detectionZone,
      webcam.video.videoWidth,
      webcam.video.videoHeight,
      webcam.video.offsetWidth,
      webcam.video.offsetHeight
    )
    console.log(isIn)
    if (o.class === "person" && isIn) {
      const body = {
        detected: o,
        picture: webcam.getScreenshot({ width: 640, height: 480 }),
      }
      console.log("body", body)
      await sendPicture(body as Detected, user)
    }
  }

  async function ifDontHaveDetectionZone(o: DetectedObject, webcam: Webcam) {
    if (o.class === "person") {
      const body = {
        detected: o,
        picture: webcam.getScreenshot({ width: 640, height: 480 }),
      }
      console.log("body", body)
      await sendPicture(body as Detected, user)
    }
  }

  async function runObjectDetection(net: ObjectDetection) {
    webcamRefs.current.forEach(async webcam => {
      if (webcam !== null && webcam.video?.readyState === 4) {
        const deviceId = (webcam.props.videoConstraints as any).deviceId
        const cameraStorage = getCameraByDeviceId(deviceId)
        if (cameraStorage.noDetectTime === null) return
        if (cameraStorage.noDetectTime.length === 8) {
          // check if the time is between the noDetectTime, split by 4 : HHmm - HHmm
          const now = new Date()
          const nowHours = now.getHours()
          const nowMinutes = now.getMinutes()
          const nowTime = `${nowHours}${nowMinutes}`
          const [start, end] = cameraStorage.noDetectTime.match(/.{1,4}/g)
          if (nowTime >= start && nowTime <= end) {
            console.log("no detect time")
            return
          }
        }
        const objectDetected = await net.detect(webcam.video, undefined, 0.5)
        objectDetected.forEach(async o => {
          if (cameraStorage.detectionZone !== null) {
            ifHaveDetectionZone(cameraStorage, o, webcam)
          } else {
            ifDontHaveDetectionZone(o, webcam)
          }
        })
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 mt-10">
      {loadCoco ? (
        <ModelLoader
          model={modelList.find(
            model => model.title === ModelComputerVision.COCO_SSD
          )}
        />
      ) : (
        <ModelSelection />
      )}
      {cameras.map((camera, index) => (
        <CameraCard
          key={index}
          camera={camera}
          index={index}
          webcamRefs={webcamRefs}
        />
      ))}
    </div>
  )
}
