"use client"

import { Card, CardContent, CardHeader } from "./ui/card"
import { useEffect, useRef, useState } from "react"
import { deletePictures } from "@/lib/send-detection/action"

import { UserView } from "@/lib/identity/definition"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import useModel from "@/hooks/use-model"
import { useModelStore } from "@/lib/store/model-store"
import useHistory from "@/hooks/use-history"
import HistorySelect from "./history-select"
import ModelSelection from "./model-selection"
import ModelLoader from "./model-loader"
import { ModelComputerVision, ModelList, modelList } from "@/models/model-list"
import { detect } from "@/lib/yolov8n/detect"
import Image from "next/image"
import { Popover, PopoverContent } from "@radix-ui/react-popover"
import { PopoverTrigger } from "./ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Badge } from "./ui/badge"
import { BotIcon, PictureInPicture2Icon } from "lucide-react"
import { Button } from "./ui/button"

interface IProps {
  user: UserView
}

export default function History({ user }: IProps) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const { modelName } = useModelStore()
  const { model, loadModel, percentLoaded } = useModel({ ready })
  const { pictures, setPictures, date, setDate } = useHistory({ user })
  const [picture, setPicture] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function handleDeleteAllSelection() {
    const confirmation = window.confirm(
      "Vous êtes sur le point de supprimer toutes les détections de la période sélectionnée. Voulez-vous continuer ?"
    )

    if (confirmation) {
      await deletePictures(date.from, date.to, user.container)
        .then(_res => setPictures([]))
        .catch(error => console.error(error))
    }
  }

  function handleCreateCanvas() {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = picture
    img.onload = async () => {
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (context) {
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
    }
  }

  async function handleRunDetection() {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = picture
    img.onload = async () => {
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (context) {
        detect(img, model, canvas)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
      <HistorySelect
        date={date}
        setDate={setDate}
        pictures={pictures}
        handleDeleteAllSelection={handleDeleteAllSelection}
        loadModel={loadModel}
      />
      {loadModel ? (
        <ModelLoader
          percent={percentLoaded}
          model={
            modelList.find(model => model.title === modelName) as ModelList
          }
        />
      ) : (
        <ModelSelection />
      )}

      <Card className="m-3 w-full lg:col-span-2 flex-grow bg-transparent border-none">
        <CardHeader className="flex flex-row items-start bg-muted/50">
          <strong>
            {date?.from?.toLocaleDateString("fr-FR", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) ||
              new Date().toLocaleDateString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            -
            {date?.to?.toLocaleDateString("fr-FR", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) ||
              new Date().toLocaleDateString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            <br />
            <span className="text-muted-foreground">
              {" "}
              ({pictures?.length} detections)
            </span>
          </strong>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            {pictures.map((picture, index) => (
              <div key={index} className="relative">
                <Dialog>
                  <DialogTrigger>
                    <Image
                      src={picture}
                      alt={"Image de la detection"}
                      width={200}
                      height={200}
                      className="rounded-lg w-full cursor-pointer"
                      onClick={() => {
                        setPicture(picture)
                        handleCreateCanvas()
                      }}
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-full max-h-full">
                    <DialogHeader className="flex-row">
                      <DialogTitle className="m-2">
                        <Badge variant="default">
                          <PictureInPicture2Icon className="mr-2 h-4 w-4" />
                          <span className="text-white">{index + 1}</span>
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        <Button
                          variant="outline"
                          className="bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-700 active:bg-blue-800 hover:text-white focus:text-white active:text-white"
                          onClick={() => {
                            handleRunDetection()
                          }}>
                          <BotIcon className="mr-2 h-4 w-4" />
                          Lancer la reconnaissance
                        </Button>
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center">
                      <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        className="max-w-full max-h-full rounded-lg"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
