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
  const [disposeCoco, setDisposeCoco] = useState(false)

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

  function disposeModel() {
    disposeCoco && cocoSsd?.dispose()
  }

  useEffect(() => {
    if (ready) {
      fetchModel()
    }
  }, [ready, modelName])

  useEffect(() => {
    disposeModel()
  }, [disposeCoco])

  return { cocoSsd, loadCoco, setDisposeCoco }
}
