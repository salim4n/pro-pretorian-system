import { ObjectDetection } from "@tensorflow-models/coco-ssd"

export const cocossdVideoInference = async (
  net: ObjectDetection,
  videoRef: React.MutableRefObject<HTMLVideoElement>,
  canvasRef: React.MutableRefObject<HTMLCanvasElement>
) => {
  if (videoRef.current && canvasRef.current) {
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const drawBoundingBoxes = async () => {
      if (video.paused || video.ended) {
        return
      }
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const predictions = await net.detect(video)
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
        requestAnimationFrame(drawBoundingBoxes)
      }

      video.addEventListener("play", drawBoundingBoxes)
    }
  }
}
