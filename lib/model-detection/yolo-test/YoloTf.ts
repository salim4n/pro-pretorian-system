import {
  loadGraphModel,
  ready,
  browser,
  image as tfImage,
  GraphModel,
  tidy,
  Tensor4D,
  engine,
  dispose,
  TensorContainer,
} from "@tensorflow/tfjs"
import { ModelConfig, PredictionData, PreprocessImage } from "./type"
import createYoloDataExtractor from "./yoloContext"

const SCORE_THRESHOLD = 0.5
const MAX_OUTPUT_SIZE = 500
const IOU_THRESHOLD = 0.45

/**
 * Load your YOLO(v5, v8) model, and prepare it for prediction of objects
 */
export class YOLOTf {
  private readonly model: GraphModel
  private readonly classes: string[]
  private readonly config: ModelConfig

  private constructor(
    model: GraphModel,
    classes: string[],
    config: ModelConfig
  ) {
    this.model = model
    this.classes = classes
    this.config = config
  }

  static async loadYoloModel(
    modelPath: string,
    classes: string[],
    config: ModelConfig
  ) {
    try {
      await ready()

      const model = await loadGraphModel(modelPath, {
        onProgress: config?.onProgress,
      })

      return new YOLOTf(model, classes, config)
    } catch (e) {
      throw Error((e as any).toString())
    }
  }

  async predict(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    preprocessImage?: PreprocessImage
  ) {
    engine().startScope()

    const { input, xRatio, yRatio } = preprocessImage
      ? preprocessImage(image)
      : this.preprocessImage(image)
    const yolo = createYoloDataExtractor(this.classes, this.config)

    const output = this.model.execute(input)
    const data = yolo.getPredictionData(output)

    const nms = await tfImage.nonMaxSuppressionAsync(
      data.boxes,
      data.scores,
      this.config.maxOutputSize || MAX_OUTPUT_SIZE,
      this.config.iouThreshold || IOU_THRESHOLD,
      this.config.scoreThreshold || SCORE_THRESHOLD
    )

    const boxes = data.boxes.gather(nms, 0).dataSync()
    const scores = data.scores.gather(nms, 0).dataSync()
    const classes = data.classes.gather(nms, 0).dataSync()

    dispose([output, data, nms] as TensorContainer)
    engine().startScope()

    return { boxes, scores, classes, xRatio, yRatio }
  }

  /**
   * Resize image to model input shape, and pad image
   */
  private preprocessImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ) {
    const shape = this.model.inputs[0].shape.slice(1, 3)
    if (!shape) {
      throw Error("Can't find the input shape in the model")
    }

    let xRatio = 1,
      yRatio = 1

    const [modelInputWidth, modelInputHeight] = shape

    const input = tidy(() => {
      const tfImg = browser.fromPixels(image)
      const [height, width] = tfImg.shape as number[]
      const maxSize = Math.max(width, height)
      const paddedImage = tfImg.pad([
        [0, maxSize - height],
        [0, maxSize - width],
        [0, 0],
      ])

      xRatio = maxSize / width
      yRatio = maxSize / height

      return tfImage
        .resizeBilinear(paddedImage as Tensor4D, [
          modelInputWidth,
          modelInputHeight,
        ])
        .div(255.0)
        .expandDims(0)
    })

    return { input, xRatio, yRatio }
  }

  renderBox(
    canvasRef: HTMLCanvasElement,
    predictionData: PredictionData,
    colors: string[]
  ) {
    const ctx = canvasRef.getContext("2d")
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const { boxes, scores, classes, ratio } = predictionData

    scores.forEach((score, index) => {
      const color = colors[classes[index]]

      let [x1, y1, x2, y2] = boxes.slice(index * 4, (index + 1) * 4)
      x1 *= ratio[0]
      x2 *= ratio[0]
      y1 *= ratio[1]
      y2 *= ratio[1]
      const width = x2 - x1
      const height = y2 - y1

      /** Draw box */
      ctx.fillStyle = YOLOTf.hexToRGB(color, 0.2)
      ctx.fillRect(x1, y1, width, height)
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(
        Math.min(ctx.canvas.width, ctx.canvas.height) / 200,
        2.5
      )
      ctx.strokeRect(x1, y1, width, height)
      ctx.font = `${Math.max(
        Math.min(ctx.canvas.width, ctx.canvas.height) / 40,
        12
      )}px Arial`
      ctx.fillStyle = color
      ctx.fillText(
        `${this.classes[classes[index]]} (${Math.round(score * 100)}%)`,
        x1,
        y1 > 10 ? y1 - 5 : 10
      )
    })
  }

  static hexToRGB(hex: string, alpha: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}
