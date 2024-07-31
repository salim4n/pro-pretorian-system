import { useModelStore } from "@/lib/store/model-store"
import { yoloLabels } from "@/lib/yolov8n/label"
import { modelList } from "@/models/model-list"
import { useEffect, useState } from "react"
import YOLOTf from "yolo-tfjs"
import * as tf from "@tensorflow/tfjs"

interface IProps {
  ready: boolean
}

export default function useYolodisTfjs({ ready }: IProps) {
  const { modelName } = useModelStore()
  const [model, setModel] = useState<YOLOTf>(null)
  const [loadModel, setLoadModel] = useState<boolean>(false)
  const [disposeDetect, setDisposeDetect] = useState<boolean>(false)
  const [percentLoaded, setPercentLoaded] = useState<number>(0)

  const modelDef = modelList.find(model => model.title === modelName)

  async function fetchModel() {
    modelName &&
      (setLoadModel(true),
      await YOLOTf.loadYoloModel(modelDef?.url, yoloLabels, {
        yoloVersion: "v8",
        onProgress(fraction: number) {
          setPercentLoaded(fraction * 100)
        },
      })
        .then(model => {
          setModel(model)
        })
        .catch(error => {
          console.error(error)
        }))

    setLoadModel(false)
  }

  useEffect(() => {
    if (ready) {
      fetchModel()
    }
  }, [ready, modelName])

  function disposeModel() {
    disposeDetect && tf.disposeVariables()
    tf.dispose()
  }

  useEffect(() => {
    disposeModel()
  }, [disposeDetect])

  return { model, loadModel, percentLoaded, setDisposeDetect }
}
