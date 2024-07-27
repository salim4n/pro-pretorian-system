import { DetectedObject } from "@tensorflow-models/coco-ssd"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function drawRect(
  detections: DetectedObject[],
  context: CanvasRenderingContext2D,
) {
  detections.forEach((predication) => {
    const [x, y, width, height] = predication.bbox

    const score = (predication.score * 100).toFixed(2) + '%'
    const label = predication.class.toUpperCase() + ' - ' + score

    // draw bounding box
    context.font = '16px Arial'
    context.strokeStyle = getRandomColor()
    context.lineWidth = 3
    context.strokeRect(x, y, width, height)

    // draw label bg
    context.fillStyle = "#000000"
    const textW = context.measureText(label).width + 10
    context.fillRect(x, y, textW, -16)

    // text on top
    context.fillStyle = "#ffffff"
    context.fillText(label, x, y)
  })
}

export const getRandomColor = () :string => 
  `#${Math.floor(Math.random() * 16777215).toString(16)}`

