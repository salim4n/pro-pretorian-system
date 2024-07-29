"use client"

import { Card, CardContent, CardHeader } from "./ui/card"
import { useEffect, useRef } from "react"
import { deletePictures } from "@/lib/send-detection/action"

import { UserView } from "@/lib/identity/definition"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import useModel from "@/hooks/use-model"
import { useModelStore } from "@/lib/store/model-store"
import useHistory from "@/hooks/use-history"
import HistorySelect from "./history-select"
import ModelSelection from "./model-selection"
import ModelLoader from "./model-loader"
import { modelList } from "@/models/model-list"
import { detect } from "@/lib/yolov8n/detect"
import Image from "next/image"

interface IProps {
  user: UserView
}

export default function History({ user }: IProps) {
  const { pictures, setPictures, date, setDate } = useHistory({ user })

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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 mt-16">
      <HistorySelect
        date={date}
        setDate={setDate}
        pictures={pictures}
        handleDeleteAllSelection={handleDeleteAllSelection}
      />

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
                <Image
                  src={picture}
                  alt={"Image de la détection"}
                  width={300}
                  height={300}
                  className="rounded-lg w-full cursor-pointer text-center transition duration-500"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
