import { cocoDataSet } from "../model-detection/yolo-test/label"

/**
 * Render prediction boxes
 * @param {HTMLCanvasElement} canvasRef canvas tag reference
 * @param {Array} boxes_data boxes array
 * @param {Array} scores_data scores array
 * @param {Array} classes_data class array
 * @param {Array[Number]} ratios boxes ratio [xRatio, yRatio]
 */
export const renderBoxes = (
  context: CanvasRenderingContext2D,
  boxes_data: number[],
  scores_data: number[],
  classes_data: number[],
  ratios: number[]
) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height) // clean canvas

  const colors = new Colors()

  // font configs
  const font = `${Math.max(
    Math.round(Math.max(context.canvas.width, context.canvas.height) / 40),
    14
  )}px Arial`
  context.font = font
  context.textBaseline = "top"

  for (let i = 0; i < scores_data.length; ++i) {
    // filter based on class threshold
    const klass = cocoDataSet[classes_data[i]] || "unknown"
    const color = colors.get(classes_data[i])
    const score = (scores_data[i] * 100).toFixed(1)

    let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4)
    x1 *= ratios[0]
    x2 *= ratios[0]
    y1 *= ratios[1]
    y2 *= ratios[1]
    const width = x2 - x1
    const height = y2 - y1
    // draw border box.
    context.strokeStyle = color
    context.lineWidth = Math.max(
      Math.min(context.canvas.width, context.canvas.height) / 200,
      2.5
    )
    context.strokeRect(x1, y1, width, height)

    // Draw the label background.
    context.fillStyle = color
    const textWidth = context.measureText(klass + " - " + score + "%").width
    const textHeight = parseInt(font, 10) // base 10
    const yText = y1 - (textHeight + context.lineWidth)
    context.fillRect(
      x1 - 1,
      yText < 0 ? 0 : yText, // handle overflow label box
      textWidth + context.lineWidth,
      textHeight + context.lineWidth
    )

    // Draw labels
    context.fillStyle = "#ffffff"
    context.fillText(klass + " - " + score + "%", x1 - 1, yText < 0 ? 0 : yText)
  }
}

class Colors {
  palette: string[]
  n: number
  // ultralytics color palette https://ultralytics.com/
  constructor() {
    this.palette = [
      "#FF3838",
      "#FF9D97",
      "#FF701F",
      "#FFB21D",
      "#CFD231",
      "#48F90A",
      "#92CC17",
      "#3DDB86",
      "#1A9334",
      "#00D4BB",
      "#2C99A8",
      "#00C2FF",
      "#344593",
      "#6473FF",
      "#0018EC",
      "#8438FF",
      "#520085",
      "#CB38FF",
      "#FF95C8",
      "#FF37C7",
    ]
    this.n = this.palette.length
  }

  get = i => this.palette[Math.floor(i) % this.n]

  static hexToRgba = (hex, alpha) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `rgba(${[
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ].join(", ")}, ${alpha})`
      : null
  }
}
