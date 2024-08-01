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

export default function ModelSelection() {
  const { modelName, setModel, disposeModel } = useModelStore()

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
          className="w-full"
          onClick={() => disposeModel()}>
          Réinitialiser
        </Button>
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
