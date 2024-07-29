"use client"

import { UserView } from "@/lib/identity/definition"
import { useState } from "react"
import { ModelComputerVision, ModelList, modelList } from "@/models/model-list"
import { detectVideo } from "@/lib/yolov8n/detect"
import ModelLoader from "./model-loader"
import { segmentVideo } from "@/lib/yolov8n-seg/detect"
import ModelSelection from "./model-selection"
import { useModelStore } from "@/lib/store/model-store"
import VideoReader from "./video-reader"
import VideoSelect from "./video-select"
import { useVideoStore } from "@/hooks/use-video-store"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import useModel from "@/hooks/use-model"

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const [loadModel, setLoadModel] = useState<boolean>(false)
  const [percentLoaded, setPercentLoaded] = useState<number>(0)
  const { modelName } = useModelStore()
  const { model } = useModel({ ready, setLoadModel, setPercentLoaded })
  const { canvasRef, videoRef, videoSrc, setVideoSrc } = useVideoStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)
    }
  }

  const handleCreateVideoWithBoundingBox = () => {
    if (modelName === ModelComputerVision.DETECTION) {
      detectVideo(videoRef.current, model, canvasRef)
    } else if (modelName === ModelComputerVision.SEGMENTATION) {
      segmentVideo(videoRef.current, model as any, canvasRef.current)
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
        {loadModel ? (
          <ModelLoader
            percent={percentLoaded}
            model={
              modelList.find(model => model.title === modelName) as ModelList
            }
          />
        ) : (
          <ModelSelection />
        )}
      </div>
    </main>
  )
}
