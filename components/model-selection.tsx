"use client"

import { ModelComputerVision } from "@/models/model-list"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useModelStore } from "@/lib/store/model-store"
import MultipleSelector, { Option } from "./ui/multiple-select"
import useModelDetectionStorage from "@/hooks/use-model-detection-storage"
import { useEffect, useState } from "react"
import { Label } from "./ui/label"

export default function ModelSelection() {
  const { modelName, setModel, disposeModel } = useModelStore()
  const [options, setOptions] = useState<Option[]>([])
  const { labelsToDetect, setLabelsToDetect } = useModelDetectionStorage({
    modelName,
  })

  useEffect(() => {
    if (modelName === ModelComputerVision.EMPTY) {
      setOptions([])
    }
    const options: Option[] = labelsToDetect.map(label => {
      return {
        value: label.label,
        label: label.label,
      } as Option
    })
    setOptions(options)
  }, [labelsToDetect])

  function getDefaultValue() {
    return labelsToDetect
      .filter(label => label.toDetect)
      .map(label => {
        return {
          value: label.label,
          label: label.label,
        } as Option
      })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="text-lg">Modèle Sélection</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>{modelName ? modelName : "Choisissez un modèle"}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.keys(ModelComputerVision).map((key, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => setModel(ModelComputerVision[key])}>
                  {ModelComputerVision[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardContent className="p-16">
        <Button
          disabled={!modelName}
          variant="outline"
          className="w-full bg-red-500 hover:bg-red-600 transition-colors"
          onClick={() => disposeModel()}>
          Réinitialiser
        </Button>
      </CardContent>
      <CardContent className="p-6">
        <Label>Labels à détecter</Label>
        <MultipleSelector
          disabled={!modelName}
          options={options && options}
          value={getDefaultValue()}
          className=" bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm "
          emptyIndicator={
            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
              Aucun label à détecter
            </p>
          }
          onChange={(selectedOptions: Option[]) => {
            const labels = labelsToDetect.map(label => {
              return {
                label: label.label,
                toDetect: selectedOptions.some(
                  selectedOption => selectedOption.value === label.label
                ),
              }
            })
            console.log("labels", labels)
            setLabelsToDetect(labels)
          }}
        />
      </CardContent>
    </Card>
  )
}

function ChevronDownIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
