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

interface IProps {
  user: UserView
}

export default function VideoInference({ user }: IProps) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const { cocoSsd, loadCoco } = useCocoSsd({ ready })
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
    if (cocoSsd && videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const drawBoundingBoxes = async () => {
        if (video.paused || video.ended) {
          return
        }
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
          const predictions = await cocoSsd.detect(video)

          predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox
            context.strokeStyle = "#00FFFF"
            context.lineWidth = 2
            context.strokeRect(x, y, width, height)
            context.font = "16px sans-serif"
            context.fillStyle = "#00FFFF"
            context.fillText(
              `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
              x,
              y > 10 ? y - 5 : 10
            )
          })
        }
        requestAnimationFrame(drawBoundingBoxes)
      }

      video.addEventListener("play", drawBoundingBoxes)
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
        {loadModel || loadCoco ? (
          <ModelLoader
            percent={percentLoaded && percentLoaded}
            model={modelList.find(
              model =>
                model.title === ModelComputerVision.COCO_SSD ||
                model.title === ModelComputerVision.DETECTION ||
                model.title === ModelComputerVision.SEGMENTATION
            )}
          />
        ) : (
          <ModelSelection />
        )}
      </div>
    </main>
  )
}
