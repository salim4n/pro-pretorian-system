import YOLOTf from "yolo-tfjs"

const detectYoloVideo = async (
  video: HTMLVideoElement,
  context: CanvasRenderingContext2D,
  model: YOLOTf
) => {
  if (video.paused || video.ended || video.readyState < 2) {
    return
  }
  if (context) {
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
    //convert video frame to ImageHtmlElement
    const image = new Image()
    image.src = getVideoFrameAsDataURL(video)
    //detect objects in the image
    const predictions = await model.predict(image)
    console.log("predictions", predictions)
  }

  requestAnimationFrame(() => detectYoloVideo(video, context, model))
}

function getVideoFrameAsDataURL(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext("2d")
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  return canvas.toDataURL()
}

export default detectYoloVideo
