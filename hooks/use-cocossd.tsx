import { useModelStore } from "@/lib/store/model-store"
import { useEffect, useState } from "react"
import { ObjectDetection, load } from "@tensorflow-models/coco-ssd"
import { ModelComputerVision } from "@/models/model-list"

interface IProps {
  ready: boolean
}

export default function useCocoSsd({ ready }: IProps) {
  const { modelName } = useModelStore()
  const [cocoSsd, setCocoSsd] = useState<ObjectDetection>(null)
  const [loadCoco, setLoadCoco] = useState(false)

  async function fetchModel() {
    modelName === ModelComputerVision.COCO_SSD &&
      (setLoadCoco(true),
      await load()
        .then(model => {
          setCocoSsd(model)
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => setLoadCoco(false)))
  }

  useEffect(() => {
    if (ready) {
      fetchModel()
    }

    if (modelName === ModelComputerVision.EMPTY) {
      setCocoSsd(null)
      cocoSsd?.dispose()
    }
  }, [ready, modelName])

  return { cocoSsd, loadCoco }
}
