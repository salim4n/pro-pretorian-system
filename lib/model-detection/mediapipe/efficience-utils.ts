import { ObjectDetector } from "@mediapipe/tasks-vision"

let lastVideoTime = -1

const detectVideo = async (
  video: HTMLVideoElement,
  context: CanvasRenderingContext2D,
  objectDetector: ObjectDetector
) => {
  if (context) {
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
    let startTimeMs = performance.now()
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime
      const detections = objectDetector.detectForVideo(video, startTimeMs)
      console.log("detections", detections)
      for (const detection of detections?.detections) {
        const originX = detection.boundingBox[0]
        const originY = detection.boundingBox[1]
        const width = detection.boundingBox[2]
        const height = detection.boundingBox[3]
        const angle = detection.boundingBox[4]
        const score = detection.categories[0].score
        const label = detection.categories[0].categoryName
        context.strokeStyle = "#00FFFF"
        context.lineWidth = 2
        context.strokeRect(originX, originY, width, height)
        context.font = "16px sans-serif"
        context.fillStyle = "#00FFFF"
        context.fillText(
          `${label} (${Math.round(score * 100)}%)`,
          originX,
          originY > 10 ? originY - 5 : 10
        )
      }

      console.log("context", context)
    }

    requestAnimationFrame(() => detectVideo(video, context, objectDetector))
  }
}

export default detectVideo
