"use client"

import { useRef, useState } from "react"
import { UserView } from "@/lib/identity/definition"
import { deletePictures } from "@/lib/send-detection/action"
import useHistory from "@/hooks/use-history"
import useCocoSsd from "@/hooks/use-cocossd"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"
import ModelLoader from "./model-loader"
import { ModelComputerVision, modelList } from "@/models/model-list"
import HistorySelect from "./history-select"
import ModelSelection from "./model-selection"
import usePredictHistory from "@/hooks/use-predict-history"
import DisplayHistory from "./display-history"

interface IProps {
  user: UserView
}

export default function History({ user }: IProps) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const [loading, setLoading] = useState<boolean>(false)
  const { pictures, setPictures, date, setDate } = useHistory({ user })
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const canvasRefs = useRef<HTMLCanvasElement[]>([])
  const { cocoSsd, loadCoco } = useCocoSsd({ ready })

  usePredictHistory({ cocoSsd, pictures, canvasRefs })

  async function handleDeleteAllSelection() {
    const confirmation = window.confirm(
      "Vous êtes sur le point de supprimer toutes les détections de la période sélectionnée. Voulez-vous continuer ?"
    )

    if (confirmation) {
      setLoading(true)
      setIsDeleting(true)
      await deletePictures(date.from, date.to, user.container)
        .then(_res => {
          setPictures([])
        })
        .catch(error => {
          setLoading(false)
        })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 mt-10">
      {loadCoco ? (
        <ModelLoader
          model={modelList.find(
            model => model.title === ModelComputerVision.COCO_SSD
          )}
        />
      ) : (
        <ModelSelection />
      )}
      <HistorySelect
        date={date}
        setDate={setDate}
        pictures={pictures}
        handleDeleteAllSelection={handleDeleteAllSelection}
      />
      <DisplayHistory pictures={pictures} canvasRefs={canvasRefs} />
    </div>
  )
}
