"use client"

import "@tensorflow/tfjs-backend-webgl"
import * as tf from "@tensorflow/tfjs"
import { ObjectDetection, load } from "@tensorflow-models/coco-ssd"
import { UserView } from "@/lib/identity/definition"
import { useEffect, useState } from "react"
import { ModelComputerVision, ModelList, modelList } from "@/models/model-list"
import { cocossdVideoInference } from "@/lib/cocossd/detect"
import { detectVideo } from "@/lib/yolov8n/detect"
import ModelLoader from "./model-loader"
import { segmentVideo } from "@/lib/yolov8n-seg/detect"
import ModelSelection from "./model-selection"
import { useModelStore } from "@/lib/store/model-store"
import VideoReader from "./video-reader"
import VideoSelect from "./video-select"
import { useVideoStore } from "@/hooks/use-video-store"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"

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
  const [loadModel, setLoadModel] = useState<boolean>(false)
  const [percentLoaded, setPercentLoaded] = useState<number>(0)
  const { modelName } = useModelStore()
  const { canvasRef, videoRef, videoSrc, setVideoSrc } = useVideoStore()
  const ready = useTfjsBackendWeb({ backend: "webgl" })

  useEffect(() => {
    if (!ready) return
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
          modelList.find(model => model.title === ModelComputerVision.DETECTION)
            ?.url as string,
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
  }, [modelName, ready])

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
