"use client"

import useModelDetectionStorage from "@/hooks/use-model-detection-storage"
import { useModelStore } from "@/lib/store/model-store"
import { Card } from "./ui/card"
import { Label } from "./ui/label"
import { ModelDetectionStore } from "@/lib/data/local-storage/model-detection-store"

export default function LabelDetection() {
  const { modelName } = useModelStore()
  const { labelsToDetect, setLabelsToDetect } = useModelDetectionStorage({
    modelName,
  })

  return (
    <div className="flex flex-wrap justify-start">
      {labelsToDetect.map((label, index) => (
        <Card
          key={index}
          className={`${
            label.toDetect ? "bg-primary/50" : "bg-muted/100"
          } p-4 m-4`}>
          <div className="flex items-center gap-4">
            <input
              className="cursor-pointer"
              type="checkbox"
              checked={label.toDetect}
              onChange={() => {
                const updatedLabel = { ...label, toDetect: !label.toDetect }
                const storage = localStorage.getItem(`${modelName}`)
                if (storage) {
                  const model: ModelDetectionStore = JSON.parse(storage)
                  model.labelsToDetect = model.labelsToDetect.map(l => {
                    if (l.label === updatedLabel.label) {
                      return updatedLabel
                    }
                    return l
                  })
                  localStorage.setItem(`${modelName}`, JSON.stringify(model))
                }
                setLabelsToDetect(
                  labelsToDetect.map((l, i) => (i === index ? updatedLabel : l))
                )
              }}
            />
            <Label className="m-2">{label.label}</Label>
          </div>
        </Card>
      ))}
    </div>
  )
}
