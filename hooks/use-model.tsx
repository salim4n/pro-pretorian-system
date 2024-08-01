import { useModelStore } from "@/lib/store/model-store"
import { useEffect, useState } from "react"
import * as tf from "@tensorflow/tfjs"
import { ModelComputerVision, modelList } from "@/models/model-list"

interface IProps {
  ready: boolean
}

export type ModelGraph = {
  net: tf.GraphModel<string | tf.io.IOHandler>
  inputShape: number[]
  outputShape?: number[]
}

export default function useModel({ ready }: IProps) {
  const { modelName } = useModelStore()
  const [model, setModel] = useState<ModelGraph>(null)
  const [loadModel, setLoadModel] = useState<boolean>(false)
  const [percentLoaded, setPercentLoaded] = useState<number>(0)

  useEffect(() => {
    if (!ready) return
    if (modelName === ModelComputerVision.DETECTION) {
      model && model?.net.dispose()
      setLoadModel(true)
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

        setModel({
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
        }) // set model & input shape

        tf.dispose([warmupResults, dummyInput]) // cleanup memory
        setLoadModel(false)
      })
    }
    if (modelName === ModelComputerVision.SEGMENTATION) {
      model && model?.net.dispose()
      setLoadModel(true)
      tf.ready().then(async () => {
        const yolov8 = await tf.loadGraphModel(
          modelList.find(
            model => model?.title === ModelComputerVision.SEGMENTATION
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

        setModel(prevState => ({
          ...prevState,
          net: yolov8,
          inputShape: yolov8.inputs[0].shape,
          outputShape: (warmupResults as any).map(
            (e: { shape: any }) => e.shape
          ),
        })) // set model & input shape

        tf.dispose([warmupResults, dummyInput]) // cleanup memory
        setLoadModel(false)
      })
    }
    if (modelName === ModelComputerVision.EMPTY) {
      if (model && model.net) {
        model.net.dispose()
        console.log(tf.memory())
      }
      setModel(null)
    }
  }, [modelName, ready])

  return { model, loadModel, percentLoaded }
}
