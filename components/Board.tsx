"use client"

import { type ObjectDetection } from "@tensorflow-models/coco-ssd"
import { sendPicture } from "@/lib/send-detection/action"
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
import {
  LabelToDetect,
  ModelDetectionStore,
  getModelDetectionStorage,
} from "@/lib/data/local-storage/model-detection-store"

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
    const canvasWidthDetection = width * xRatio
    const canvasHeightDetection = height * yRatio

    const zoneRight = zoneX + zoneWidth
    const zoneBottom = zoneY + zoneHeight

    const detectionPoints = [
      { x: canvasX, y: canvasY }, // top left
      { x: canvasX + canvasWidthDetection, y: canvasY }, // top right
      { x: canvasX, y: canvasY + canvasHeightDetection }, // bottom left
      { x: canvasX + canvasWidthDetection, y: canvasY + canvasHeightDetection }, // bottom right
    ]

    return detectionPoints.some(
      point =>
        point.x >= zoneX &&
        point.x <= zoneRight &&
        point.y >= zoneY &&
        point.y <= zoneBottom
    )
  }

  async function ifHaveDetectionZone(
    cameraStorage: CameraStored,
    objDetected: DetectedObject[],
    webcam: Webcam
  ) {
    let isIn = false
    for (const o of objDetected) {
      isIn = isDetectionInZone(
        o.bbox,
        cameraStorage.detectionZone,
        webcam.video.videoWidth,
        webcam.video.videoHeight,
        webcam.video.offsetWidth,
        webcam.video.offsetHeight
      )
      if (isIn) {
        break
      }
    }
    const detectionStorage = getModelDetectionStorage(
      ModelComputerVision.COCO_SSD
    )
    if (
      objDetected.find(o =>
        detectionStorage.labelsToDetect.find(label => label.label === o.class)
      ) &&
      isIn
    ) {
      const body = {
        detected: objDetected,
        picture: webcam.getScreenshot({ width: 640, height: 480 }),
      }
      console.log("body", body)
      await sendPicture(body, user)
    }
  }

  async function ifDontHaveDetectionZone(
    objDetected: DetectedObject[],
    webcam: Webcam
  ) {
    const detectionStorage = getModelDetectionStorage(
      ModelComputerVision.COCO_SSD
    )
    if (
      objDetected.find((od: DetectedObject) =>
        detectionStorage.labelsToDetect.find(
          (ltd: LabelToDetect) => ltd.label === od.class && ltd.toDetect
        )
      )
    ) {
      console.log("detected", objDetected)
      console.log(
        "is in labels to detect",
        detectionStorage.labelsToDetect.find(
          (ltd: LabelToDetect) => ltd.toDetect
        )
      )
      const body = {
        detected: objDetected,
        picture: webcam.getScreenshot({ width: 640, height: 480 }),
      }
      await sendPicture(body, user)
    }
  }

  async function runObjectDetection(net: ObjectDetection) {
    webcamRefs.current.forEach(async webcam => {
      if (webcam !== null && webcam.video?.readyState === 4) {
        const deviceId = (webcam.props.videoConstraints as any).deviceId
        const cameraStorage = getCameraByDeviceId(deviceId)
        if (cameraStorage?.noDetectTime?.length === 8) {
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
        console.log("detecting")
        const objectDetected = await net.detect(webcam.video, undefined, 0.1)
        if (cameraStorage.detectionZone !== null) {
          ifHaveDetectionZone(cameraStorage, objectDetected, webcam)
        } else {
          ifDontHaveDetectionZone(objectDetected, webcam)
        }
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
