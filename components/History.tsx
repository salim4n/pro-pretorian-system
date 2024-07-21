"use client"

import '@tensorflow/tfjs-backend-webgl'
import * as tf from '@tensorflow/tfjs'
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { useEffect, useRef, useState } from "react"
import { useToast } from "./ui/use-toast"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { ObjectDetection, load } from "@tensorflow-models/coco-ssd"
import { deletePictures, getPictures } from "@/app/lib/send-detection/action"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import { cn } from '@/app/lib/utils'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { BotIcon, CalendarIcon, LucideTrash2, PictureInPicture2Icon } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import Image from 'next/image'
import { UserView } from '@/app/lib/identity/definition'

interface IProps {
    user : UserView

}

export default function History({user}:IProps){
    const [loading, setLoading] = useState<boolean>(false)
    const { toast } = useToast()
    const actualDate = new Date()
    const actualYear = actualDate.getFullYear()
    const actualMonth = actualDate.getMonth()
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(actualYear, actualMonth, 1),
        to: addDays(new Date(actualYear, actualMonth, 1), 6)
    })
    const [model, setModel] = useState<ObjectDetection>(null)
    const [pictures, setPictures] = useState<string[]>([])
    const [picture, setPicture] = useState<string>("")
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isDownloading, setIsDownloading] = useState<boolean>(false)
    const [modelLoading, setModelLoading] = useState<boolean>(false)

    const loadModel = async () => {
        setLoading(true)
        setModelLoading(true)
        await load().then((model) => {
            setModel(model)
            toast({
                title: "Modèle de reconnaissance chargé",
                description: "Vous pouvez maintenant lancer la reconnaissance en cliquant sur une image"
            })
        }).catch((_error) => {
            toast({
                title: "Erreur lors du chargement du modèle de reconnaissance",
                description: "Verifiez votre connexion internet et rechargez la page",
              })
        })
        .finally(() => {
            setLoading(false)
            setModelLoading(false)
        })
    }

    async function fetchPicturesFromRange() {
        if (date && date.from && date.to) {
            const fromDateStr = date.from.toISOString()
            const toDateStr = date.to.toISOString()
            const pictures = await getPictures(fromDateStr, toDateStr,user.container)
            setPictures(pictures)
        }
    }

    useEffect(() => {
        tf.setBackend('webgl')
        loadModel()
    }, [])

    useEffect(() => {
        fetchPicturesFromRange()
    }, [date])

    const canvasRef = useRef<HTMLCanvasElement>(null)

    function handleCreateCanvas(){
        const img = new window.Image()
            img.crossOrigin = "anonymous"
            img.src = picture
            img.onload = async () => {
                const canvas = canvasRef.current
                const context = canvas?.getContext('2d')
                if (context) {
                    context.drawImage(img, 0, 0, canvas.width, canvas.height)
            }
        }
    }

    async function handleRunDetection(){
        const img = new window.Image()
        img.crossOrigin = "anonymous"
        img.src = picture
        img.onload = async () => {
            const canvas = canvasRef.current
            const context = canvas?.getContext('2d')
            if (context) {
                context.drawImage(img, 0, 0, canvas.width, canvas.height)
                const predictions = model && await model.detect(canvas)
                predictions.forEach((prediction) => {
                    const [x, y, width, height] = prediction.bbox
                    const text = `${prediction.class} (${Math.round(prediction.score * 100)}%)`
                    context.strokeStyle = "tomato"
                    context.lineWidth = 2
                    context.font = "20px Arial"
                    context.fillStyle = "tomato"
                    context.fillText(text, x, y)
                    context.rect(x, y, width, height)
                    context.stroke()
                })
            }
        }
    }

    async function handleDeleteAllSelection(){
        setLoading(true)
        setIsDeleting(true)
        await deletePictures(date.from, date.to,user.container)
            .then((_res) => {
                setPictures([])
                toast({
                    title: "Suppression des detections",
                    description: `Toutes les detections de la periode selectionnée ont été supprimées`,
                })
            })
            .catch((error) => {
                setLoading(false)
                toast({
                    title: "Erreur lors de la suppression des detections",
                    description: error.message,
                })
            })
            .finally(() => {
                setLoading(false)
                setIsDeleting(false)
            })
    }
    

    
    return loading 
        ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                 <Card className="m-3 z-50">
                <CardContent className='m-5'>
                    <div className='w-full text-center flex justify-center items-center'>
                    <Avatar className='w-48 h-48'>
                        <AvatarImage src="/icon.jpeg" />
                        <AvatarFallback>PR</AvatarFallback>
                    </Avatar>
                    <Badge variant="default" className='mt-4'>
                    <strong className='ml-4'>
                                {modelLoading  && "Chargement du modèle de reconnaissance" }
                                {isDeleting && "Suppression des detections en cours" }
                                {isDownloading && "Téléchargement des detections en cours" }
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
                        {
                            Array.from({ length: 10 }).map((_, index) => (
                                <Card key={index}>
                                    <CardHeader>
                                        <Skeleton className="w-full h-10" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="w-full h-10" />
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    ) 
        : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
            <Card className="m-3 item-center text-center">
                <CardHeader>
                    <Label className="text-center"><strong>Selectionnez une période</strong></Label>
                    
                </CardHeader>
                <CardContent>
                <div className={cn("grid gap-2")}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal m-3",
                                        !date && "text-muted-foreground"
                                    )}
                                >
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
                </CardContent>
            </Card>
            <Card className="m-3">
                <CardHeader className="text-center">
                    <strong>
                        {date?.from?.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' }) || new Date().toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
                        -
                        {date?.to?.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' }) || new Date().toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}
                        <br />
                        <span className="text-muted-foreground"> ({pictures?.length} detections)</span>
                    </strong>
                </CardHeader>
                <CardContent>
                    <Button
                        className=' w-full text-center mt-4 bg-red-500 text-white hover:bg-red-600 focus:bg-red-700 active:bg-red-800'
                        variant="destructive"
                        disabled={pictures?.length === 0}
                        onClick={handleDeleteAllSelection}
                    >
                        <LucideTrash2 className="mr-2 h-4 w-4" />
                        {`Supprimer toutes les detections de la periode selectionnée - ${pictures?.length} detections`}
                    </Button>
                </CardContent>
            </Card>
            <Card className="m-3 w-full lg:col-span-2 flex-grow">
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
                        {pictures.map((picture, index) => (
                            <Card key={index} 
                                className="flex flex-col items-center w-full border-transparent"
                            >
                                <CardHeader>
                                    <CardDescription>
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
                                            <DialogContent className='max-w-full max-h-full'>
                                                <DialogHeader className='flex-row'>
                                                    <DialogTitle className='m-2'>
                                                        <Badge variant="default">
                                                            <PictureInPicture2Icon className="mr-2 h-4 w-4" />
                                                            <span className="text-white">{index + 1}</span>
                                                        </Badge>
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        <Button
                                                            variant="outline"
                                                            className='bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-700 active:bg-blue-800 hover:text-white focus:text-white active:text-white'
                                                            onClick={() => {
                                                                handleRunDetection()
                                                            }}
                                                        >
                                                            <BotIcon className="mr-2 h-4 w-4" />
                                                            Lancer la  reconnaissance
                                                        </Button>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex justify-center">
                                                <canvas 
                                                    ref={canvasRef} 
                                                    width={640} 
                                                    height={480} 
                                                    className='max-w-full max-h-full rounded-lg'
                                                />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}