import { cocoDataSet } from "@/lib/yolov8n/label"
import { ModelComputerVision } from "@/models/model-list"

export type LabelToDetect = {
  label: string
  toDetect: boolean
}

export type ModelDetectionStore = {
  modelName: ModelComputerVision
  labelsToDetect: LabelToDetect[]
}

function createModelDetectionStorage() {
  Object.values(ModelComputerVision).forEach(key => {
    localStorage.setItem(
      `${key}`,
      JSON.stringify({
        modelName: ModelComputerVision[key],
        labelsToDetect: cocoDataSet.map(label => ({ label, toDetect: false })),
      })
    )
  })
}

function getModelDetectionStorage(
  modelName: ModelComputerVision
): ModelDetectionStore {
  return JSON.parse(localStorage.getItem(`${modelName}`) || "{}")
}

function addModelDetectionToLocalStorage(model: ModelDetectionStore) {
  localStorage.setItem(`${model.modelName}`, JSON.stringify(model))
}

function updateModelDetectionInLocalStorage(
  modelName: ModelComputerVision,
  model: ModelDetectionStore
) {
  localStorage.setItem(`${modelName}`, JSON.stringify(model))
}

function removeModelDetectionFromLocalStorage(modelName: ModelComputerVision) {
  localStorage.removeItem(`${modelName}`)
}

function getAllModelsDetectionFromLocalStorage(): ModelDetectionStore[] {
  return Object.values(ModelComputerVision).map(key =>
    JSON.parse(localStorage.getItem(`${key}`) || "{}")
  )
}

function updateLabelsToDetect(
  modelName: ModelComputerVision,
  labelsToDetect: LabelToDetect[]
) {
  const model = JSON.parse(localStorage.getItem(`${modelName}`) || "{}")
  model.labelsToDetect = labelsToDetect
  localStorage.setItem(`${modelName}`, JSON.stringify(model))
}

export {
  createModelDetectionStorage,
  addModelDetectionToLocalStorage,
  getModelDetectionStorage,
  updateModelDetectionInLocalStorage,
  removeModelDetectionFromLocalStorage,
  getAllModelsDetectionFromLocalStorage,
  updateLabelsToDetect,
}
