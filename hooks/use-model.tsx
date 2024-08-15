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
