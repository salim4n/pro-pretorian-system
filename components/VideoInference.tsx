"use client"

import { ModelComputerVision, modelList } from "@/models/model-list"
import { UserView } from "@/lib/identity/definition"
import ModelLoader from "./model-loader"
import useCocoSsd from "@/hooks/use-cocossd"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import ModelSelection from "./model-selection"
import useYoloTfjs from "@/hooks/use-yolo-tfjs"
import VideoSelect from "./video-select"
import { useVideo } from "@/hooks/use-video"
import VideoReader from "./video-reader"
import {
  DELEGATE_CPU,
  DELEGATE_GPU,
  RUNNING_MODE_VIDEO,
} from "@/lib/mediapipe-utils/definitions"
import useMediapipeDetector from "@/hooks/use-mediapipe-detector"
import { useModelStore } from "@/lib/store/model-store"
import drawBoundingBoxes from "@/lib/model-detection/coco-ssd/utils"
import detectVideo from "@/lib/model-detection/mediapipe/efficience-utils"
import useInterval from "@/hooks/use-interval"
import detectYoloVideo from "@/lib/model-detection/yolov8n/utils"

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const { modelName } = useModelStore()
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const { cocoSsd, loadCoco } = useCocoSsd({ ready })
  const { objectDetector, loading } = useMediapipeDetector({
    runningMode: RUNNING_MODE_VIDEO,
    scoreThreshold: 0.5,
    delegate: DELEGATE_CPU,
  })
  const { model, loadModel, percentLoaded, setDisposeDetect } = useYoloTfjs({
    ready,
  })
  const { canvasRef, setVideoSrc, videoRef, videoSrc } = useVideo()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)
    }
  }

  const handleCreateVideoWithBoundingBox = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // modelName === ModelComputerVision.COCO_SSD &&
      //   drawBoundingBoxes(video, context, cocoSsd)

      // modelName === ModelComputerVision.MEDIAPIPEOBJECTDETECTION &&
      //   detectVideo(video, context, objectDetector)

      video.addEventListener("play", () => {
        modelName === ModelComputerVision.COCO_SSD &&
          drawBoundingBoxes(video, context, cocoSsd)
        modelName === ModelComputerVision.MEDIAPIPEOBJECTDETECTION &&
          detectVideo(video, context, objectDetector)
        modelName === ModelComputerVision.DETECTION &&
          detectYoloVideo(video, context, model)
      })
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 m-10">
      <div className="lg:col-span-2">
        <VideoReader
          videoRef={videoRef}
          canvasRef={canvasRef}
          videoSrc={videoSrc}
        />
      </div>
      <div className="grid gap-4">
        <VideoSelect
          handleFileChange={handleFileChange}
          handleCreateVideoWithBoundingBox={handleCreateVideoWithBoundingBox}
          videoRef={videoRef}
          canvasRef={canvasRef}
          videoSrc={videoSrc}
          setVideoSrc={setVideoSrc}
        />
        {loadModel || loadCoco || loading ? (
          <ModelLoader
            percent={percentLoaded && percentLoaded}
            model={modelList.find(
              model =>
                model.title === ModelComputerVision.COCO_SSD ||
                model.title === ModelComputerVision.DETECTION ||
                model.title === ModelComputerVision.SEGMENTATION ||
                model.title === ModelComputerVision.MEDIAPIPEOBJECTDETECTION
            )}
          />
        ) : (
          <ModelSelection />
        )}
      </div>
    </main>
  )
}
