import {
  LabelToDetect,
  ModelDetectionStore,
  createModelDetectionStorage,
} from "@/lib/data/local-storage/model-detection-store"
import { ModelComputerVision } from "@/models/model-list"
import { useEffect, useState } from "react"

export default function useModelDetectionStorage({
  modelName,
}: {
  modelName: ModelComputerVision
}) {
  const [labelsToDetect, setLabelsToDetect] = useState<LabelToDetect[]>([])
  const [labelToDetect, setLabelToDetect] = useState<LabelToDetect>()

  function getLabelsStoragesOrCreate() {
    Object.values(ModelComputerVision).forEach(key => {
      const storage = localStorage.getItem(`${key}`)
      if (!storage) {
        createModelDetectionStorage()
      }
    })
  }

  function getLabelToDetect(modelName: ModelComputerVision) {
    const storage = localStorage.getItem(`${modelName}`)
    if (storage) {
      const model: ModelDetectionStore = JSON.parse(storage)
      setLabelsToDetect(model.labelsToDetect.map(label => label))
    }
  }

  function setLabelToDetectStore(label: LabelToDetect) {
    const storage = localStorage.getItem(`${modelName}`)
    if (storage) {
      const model: ModelDetectionStore = JSON.parse(storage)
      model.labelsToDetect = model.labelsToDetect.map(l => {
        if (l.label === label.label) {
          return label
        }
        return l
      })
      localStorage.setItem(`${modelName}`, JSON.stringify(model))
    }
  }

  useEffect(() => {
    if (labelsToDetect.length > 0) {
      labelsToDetect.forEach(label => {
        setLabelToDetectStore(label)
      })
    }
  }, [labelsToDetect])

  useEffect(() => {
    getLabelsStoragesOrCreate()
    getLabelToDetect(modelName)
  }, [modelName])

  return { labelsToDetect, setLabelsToDetect, setLabelToDetect }
}
