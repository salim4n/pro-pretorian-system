import { ObjectDetection } from "@tensorflow-models/coco-ssd"
import { useEffect } from "react"

interface IProps {
  cocoSsd: ObjectDetection
  pictures: string[]
  canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>
}

export default function usePredictHistory({
  cocoSsd,
  pictures,
  canvasRefs,
}: IProps) {
  async function makePredictions() {
    if (cocoSsd && pictures.length > 0) {
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
            cocoSsd.detect(canvas).then(predictions => {
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
  }

  useEffect(() => {
    makePredictions()
  }, [cocoSsd, pictures])
}
