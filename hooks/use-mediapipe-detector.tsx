import { ObjectDetector, FilesetResolver } from "@mediapipe/tasks-vision"
import {
  DELEGATE_CPU,
  DELEGATE_GPU,
  RUNNING_MODE_IMAGE,
  RUNNING_MODE_VIDEO,
  VISION_URL,
} from "../lib/mediapipe-utils/definitions"
import { useEffect, useState } from "react"
import { ModelComputerVision, modelList } from "@/models/model-list"
import { useModelStore } from "@/lib/store/model-store"

import * as tf from "@tensorflow/tfjs"

interface IProps {
  runningMode: string
  scoreThreshold: number
  delegate: string
}

export default function useMediapipeDetector({
  runningMode,
  scoreThreshold = 0.5,
  delegate = DELEGATE_CPU,
}: IProps) {
  const { modelName } = useModelStore()
  const [loading, setLoading] = useState<boolean>(false)
  const [objectDetector, setObjectDetector] = useState<ObjectDetector | null>()

  async function getDetector() {
    setLoading(true)
    if (tf.getBackend() === "webgl") {
      tf.removeBackend("webgl")
    }
    // Initialize the object detector
    const initializeObjectDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(VISION_URL)
      const objDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelList.find(
            model =>
              model.title === ModelComputerVision.MEDIAPIPEOBJECTDETECTION
          ).url,
          delegate: delegate === DELEGATE_GPU ? DELEGATE_GPU : DELEGATE_CPU,
        },
        scoreThreshold: scoreThreshold,
        runningMode:
          runningMode === RUNNING_MODE_VIDEO
            ? RUNNING_MODE_VIDEO
            : RUNNING_MODE_IMAGE,
      })
      setObjectDetector(objDetector)
      setLoading(false)
    }
    initializeObjectDetector()
  }

  useEffect(() => {
    if (modelName === ModelComputerVision.MEDIAPIPEOBJECTDETECTION) {
      getDetector()
    } else {
      setObjectDetector(null)
      objectDetector?.close()
    }
  }, [modelName])

  return { objectDetector, loading }
}
