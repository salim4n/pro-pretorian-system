import { useModelStore } from "@/lib/store/model-store"
import { yoloLabels } from "@/lib/yolov8n/label"
import { modelList } from "@/models/model-list"
import { useEffect, useState } from "react"
import YOLOTf from "yolo-tfjs"

interface IProps {
  ready: boolean
}

export default function useYoloTfjs({ ready }: IProps) {
  const { modelName } = useModelStore()
  const [model, setModel] = useState<YOLOTf>(null)
  const [loadModel, setLoadModel] = useState<boolean>(false)
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

  return { model, loadModel, percentLoaded }
}
