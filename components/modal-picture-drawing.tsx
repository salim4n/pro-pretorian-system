import { drawRect } from "@/lib/utils"
import { ObjectDetection, load } from "@tensorflow-models/coco-ssd"
import { useEffect, useRef } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ModalPictureDrawing({
  picture,
  onClose,
}: {
  picture: string
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const img = new window.Image()
    img.src = picture
    img.onload = async () => {
      const net: ObjectDetection = await load()
      const canvas = canvasRef.current
      const context = canvas?.getContext("2d")
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height) // Clear previous drawings
        context.drawImage(img, 0, 0, canvas.width, canvas.height)
        const detections = await net.detect(img)
        drawRect(detections, context)
      }
    }
  }, [picture])

  return (
    <Dialog>
      <DialogTrigger>
        <img src={picture} alt="image" onClick={() => onClose()} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Image</DialogTitle>
          <DialogDescription>Image detected</DialogDescription>
        </DialogHeader>
        <canvas ref={canvasRef} width={640} height={480} />
      </DialogContent>
    </Dialog>
  )
}
