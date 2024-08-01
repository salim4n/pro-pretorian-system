import { ModelComputerVision } from "@/models/model-list"
import { create } from "zustand"

type ModelStore = {
  modelName: ModelComputerVision
  setModel: (model: ModelComputerVision) => void
  disposeModel: () => void
}

export const useModelStore = create<ModelStore>()(set => ({
  modelName: ModelComputerVision.EMPTY,
  setModel: modelName => set({ modelName }),
  disposeModel: () => {
    set({ modelName: ModelComputerVision.EMPTY })
  },
}))
