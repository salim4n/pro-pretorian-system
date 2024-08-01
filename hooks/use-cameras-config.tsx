import {
  CameraStored,
  addCameraToLocalStorage,
  cameraStorageTitle,
  createCameraStorage,
  getAllCamerasFromLocalStorage,
} from "@/lib/data/local-storage/camera-store"
import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"

export default function useCamerasConfig() {
  const webcamRefs = useRef<Webcam[]>([])
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])

  function getCameraStorageOrCreate() {
    const storage = localStorage.getItem(cameraStorageTitle)
    if (storage) {
      const camerasStored: CameraStored[] = JSON.parse(storage)
      console.log("camerasStored", camerasStored)
    } else createCameraStorage()
  }

  useEffect(() => {
    getCameraStorageOrCreate()
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(
        device => device.kind === "videoinput"
      )
      setCameras(videoDevices)
      const cameraToStorage: CameraStored = {
        noDetectTime: null,
        deviceId: videoDevices[0].deviceId,
        label: videoDevices[0].label,
        haveDetectionZone: false,
        detectionZone: null,
      }
      const allCameraStored = getAllCamerasFromLocalStorage()
      console.log("allCameraStored", allCameraStored)
      if (allCameraStored.length === 0) {
        addCameraToLocalStorage(cameraToStorage)
      } else if (
        !allCameraStored
          .map(camera => camera.deviceId)
          .includes(videoDevices[0].deviceId)
      ) {
        addCameraToLocalStorage(cameraToStorage)
      }
    })
  }, [])

  return { webcamRefs, cameras }
}
