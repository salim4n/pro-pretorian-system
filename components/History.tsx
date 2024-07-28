"use client"

import { Card, CardContent, CardHeader } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { useEffect, useRef, useState } from "react"
import { useToast } from "./ui/use-toast"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { ObjectDetection, load } from "@tensorflow-models/coco-ssd"
import { deletePictures, getPictures } from "@/lib/send-detection/action"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, LucideTrash2 } from "lucide-react"
import { Calendar } from "./ui/calendar"
import Image from "next/image"
import { UserView } from "@/lib/identity/definition"
import { CardBody, CardContainer, CardItem } from "./ui/3d-card"
import { BackgroundGradient } from "./ui/background-gradient"
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend"

interface IProps {
  user: UserView
}

export default function History({ user }: IProps) {
  const ready = useTfjsBackendWeb({ backend: "webgl" })
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()
  const actualDate = new Date()
  const actualYear = actualDate.getFullYear()
  const actualMonth = actualDate.getMonth()
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(actualYear, actualMonth, 1),
    to: addDays(new Date(actualYear, actualMonth, 1), 6),
  })
  const [coco, setCoco] = useState<ObjectDetection | null>(null)
  const [yolo, setYolo] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }) // init model & input shape of YOLO DETECTION
  const [yoloSeg, setYoloSeg] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }) // init model & input shape of YOLO SEGMENTATION
  const [pictures, setPictures] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [modelLoading, setModelLoading] = useState<boolean>(false)
  const canvasRefs = useRef<HTMLCanvasElement[]>([])

  const loadModel = async () => {
    setLoading(true)
    setModelLoading(true)
    try {
      const loadedModel = await load()
      setCoco(loadedModel)
      toast({
        title: "Modèle de reconnaissance chargé",
        description:
          "Vous pouvez maintenant lancer la reconnaissance en cliquant sur une image",
      })
    } catch (_error) {
      toast({
        title: "Erreur lors du chargement du modèle de reconnaissance",
        description: "Vérifiez votre connexion internet et rechargez la page",
      })
    } finally {
      setLoading(false)
      setModelLoading(false)
    }
  }

  const fetchPicturesFromRange = async () => {
    if (date && date.from && date.to) {
      const fromDateStr = date.from.toISOString()
      const toDateStr = date.to.toISOString()
      const pictures = await getPictures(fromDateStr, toDateStr, user.container)
      setPictures(pictures)
    }
  }

  useEffect(() => {
    if (ready) {
      loadModel()
    }
  }, [ready])

  useEffect(() => {
    fetchPicturesFromRange()
  }, [date])

  useEffect(() => {
    if (coco && pictures.length > 0) {
      pictures.forEach((picture, index) => {
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.src = picture
        img.onload = () => {
          const canvas = canvasRefs.current[index]
          const context = canvas?.getContext("2d")
          if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height)
            context.drawImage(img, 0, 0, canvas.width, canvas.height)
            coco.detect(canvas).then(predictions => {
              predictions.forEach(prediction => {
                const [x, y, width, height] = prediction.bbox
                const text = `${prediction.class} (${Math.round(
                  prediction.score * 100
                )}%)`
                // easy to see colors we need
                context.strokeStyle = "#FF0000"
                // line width bold
                context.lineWidth = 4
                // font size and font family
                context.font = "20px Arial"
                // fill text color
                context.fillStyle = "#FF0000"
                context.fillText(text, x, y)
                context.rect(x, y, width, height)
                context.stroke()
              })
            })
          }
        }
      })
    }
  }, [coco, pictures])

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
          toast({
            title: "Suppression des détections",
            description: `Toutes les détections de la période sélectionnée ont été supprimées`,
          })
        })
        .catch(error => {
          setLoading(false)
          toast({
            title: "Erreur lors de la suppression des détections",
            description: error.message,
          })
        })
    }
  }

  return loading ? (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
      <Card className="m-3 z-50">
        <CardContent className="m-5">
          <div className="w-full text-center flex justify-center items-center">
            <Avatar className="w-48 h-48">
              <AvatarImage src="/icon.jpeg" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <Badge variant="default" className="mt-4">
              <strong className="ml-4">
                {modelLoading && "Chargement du modèle de reconnaissance"}
                {isDeleting && "Suppression des detections en cours"}
              </strong>
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card className="m-3">
        <CardHeader>
          <Skeleton className="w-full h-10" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-10" />
        </CardContent>
      </Card>
      <Card className="m-3 w-full lg:col-span-2 flex-grow">
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="w-full h-10" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-full h-10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
      <CardContainer className="m-3 item-center text-center">
        <CardBody className="bg-gradient relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
          <CardItem translateZ="50" className="text-sm font-bold">
            <strong>Selectionnez une période</strong>
          </CardItem>
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal m-3",
                    !date && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd LLL, y")} -{" "}
                        {format(date.to, "dd LLL, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Selectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardBody>
      </CardContainer>
      <CardContainer className="m-3 item-center text-center">
        <CardBody className="bg-gradient relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
          <CardItem translateZ="50" className="text-sm font-bold">
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
          </CardItem>
          <CardItem translateZ="50" className="text-sm font-bold">
            <Button
              className=" w-full text-center mt-4"
              variant="destructive"
              disabled={pictures?.length === 0}
              onClick={handleDeleteAllSelection}>
              <LucideTrash2 className="mr-2 h-4 w-4" />
              {`Supprimer toutes les détections de la période sélectionnée`}
            </Button>
          </CardItem>
        </CardBody>
      </CardContainer>
      <Card className="m-3 w-full lg:col-span-2 flex-grow bg-transparent border-none">
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            {pictures.map((picture, index) => (
              <div key={index} className="relative">
                <BackgroundGradient>
                  <Image
                    src={picture}
                    alt={"Image de la détection"}
                    width={300}
                    height={300}
                    className="rounded-lg w-full cursor-pointer text-center transition duration-500"
                  />
                </BackgroundGradient>
                <canvas
                  // @ts-ignore
                  ref={el => (canvasRefs.current[index] = el!)}
                  width={300}
                  height={300}
                  className="absolute top-0 left-0 rounded-lg w-full h-full cursor-pointer text-center transition duration-500 z-50"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
