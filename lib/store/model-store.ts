import { create } from "zustand"

type ModelStore = {
  modelName: string
  setModel: (model: string) => void
}

export const useModelStore = create<ModelStore>()(set => ({
  modelName: "",
  setModel: modelName => set({ modelName }),
}))
