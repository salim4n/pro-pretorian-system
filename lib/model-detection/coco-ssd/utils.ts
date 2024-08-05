import { ObjectDetection } from "@tensorflow-models/coco-ssd"

const drawBoundingBoxes = async (
  video: HTMLVideoElement,
  context: CanvasRenderingContext2D,
  cocoSsd: ObjectDetection
) => {
  if (video.paused || video.ended) {
    return
  }
  if (context) {
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
    let predictions = []
    predictions = await cocoSsd.detect(video)
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox
      context.strokeStyle = "#00FFFF"
      context.lineWidth = 2
      context.strokeRect(x, y, width, height)
      context.font = "16px sans-serif"
      context.fillStyle = "#00FFFF"
      context.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        x,
        y > 10 ? y - 5 : 10
      )
    })
  }
  requestAnimationFrame(() => drawBoundingBoxes(video, context, cocoSsd))
}

export default drawBoundingBoxes
