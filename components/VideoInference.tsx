"use client"

import { UserView } from "@/lib/identity/definition"
import { ModelComputerVision, ModelList, modelList } from "@/models/model-list"
import { detectVideo } from "@/lib/yolov8n/detect"
import ModelLoader from "./model-loader"
import { segmentVideo } from "@/lib/yolov8n-seg/detect"
import ModelSelection from "./model-selection"
import { useModelStore } from "@/lib/store/model-store"
import VideoReader from "./video-reader"
import VideoSelect from "./video-select"
import { useVideo } from "@/hooks/use-video"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import useModel from "@/hooks/use-model"

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const { modelName } = useModelStore()
  const { model, loadModel, percentLoaded } = useModel({ ready })
  const { canvasRef, videoRef, videoSrc, setVideoSrc } = useVideo()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)

      const video = document.createElement("video")
      video.src = videoURL
    }
  }

  const handleCreateVideoWithBoundingBox = () => {
    // Définir une taille maximale pour le canvas et la vidéo
    const maxWidth = 600
    const maxHeight = 400

    // Calculer le ratio d'aspect de la vidéo
    const aspectRatio =
      videoRef.current.videoWidth / videoRef.current.videoHeight

    // Calculer les nouvelles dimensions de la vidéo
    let newWidth = videoRef.current.videoWidth
    let newHeight = videoRef.current.videoHeight

    if (newWidth > maxWidth) {
      newWidth = maxWidth
      newHeight = newWidth / aspectRatio
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight
      newWidth = newHeight * aspectRatio
    }

    // Ajuster les dimensions du canvas et de la vidéo
    canvasRef.current.width = newWidth
    canvasRef.current.height = newHeight
    videoRef.current.width = newWidth
    videoRef.current.height = newHeight

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
