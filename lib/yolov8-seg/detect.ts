import * as tf from "@tensorflow/tfjs"
import { renderBoxes, Colors } from "./renderBox"
import { labels } from "./labels"
import { type } from "os"

const numClass = labels.length
const colors = new Colors()

/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio // ratios for boxes

  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source)

    // padding image to square => [n, m] to [n, n], n > m
    const [h, w] = img.shape.slice(0, 2) // get source width and height
    const maxSize = Math.max(w, h) // get max size
    const imgPadded = img.pad([
      [0, maxSize - h], // padding y [bottom only]
      [0, maxSize - w], // padding x [right only]
      [0, 0],
    ])

    xRatio = maxSize / w // update xRatio
    yRatio = maxSize / h // update yRatio

    return tf.image
      .resizeBilinear(imgPadded as any, [modelWidth, modelHeight]) // resize frame
      .div(255.0) // normalize
      .expandDims(0) // add batch
  })

  return [input, xRatio, yRatio]
}

/**
 * Function to detect image.
 * @param {HTMLImageElement} source Source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {VoidFunction} callback Callback function to run after detect frame is done
 */
export const detectFrame = async (
  source,
  model,
  canvasRef,
  callback = () => {}
) => {
  const [modelHeight, modelWidth] = model.inputShape.slice(1, 3) // get model width and height
  console.log(model.outputShape)
  const [modelSegHeight, modelSegWidth, modelSegChannel] =
    model?.outputShape[1].slice(1) // get model segmentation output shape

  tf.engine().startScope() // start scoping tf engine

  const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight) // do preprocessing

  const res = model.net.execute(input) // execute model
  console.log("res", res[0].shape, res[1].shape)
  console.table(res)

  // Check the shape of res[0]
  const res0Shape = res[0].shape
  console.log("res[0] shape:", res0Shape)

  let transRes
  if (res0Shape.length === 4) {
    transRes = tf.tidy(() => res[0].transpose([0, 2, 3, 1]).squeeze()) // Adjust permutation for rank 4
  } else if (res0Shape.length === 3) {
    transRes = tf.tidy(() => res[0].transpose([0, 2, 1]).squeeze()) // Original permutation for rank 3
  } else {
    throw new Error("Unexpected tensor shape for res[0]")
  }

  // Check the shape of res[1]
  const res1Shape = res[1].shape
  console.log("res[1] shape:", res1Shape)

  let transSegMask
  if (res1Shape.length === 4) {
    transSegMask = tf.tidy(() => res[1].transpose([0, 3, 1, 2]).squeeze()) // Adjust permutation for rank 4
  } else if (res1Shape.length === 3) {
    transSegMask = tf.tidy(() => res[1].transpose([0, 2, 1]).squeeze()) // Adjust permutation for rank 3
  } else {
    throw new Error("Unexpected tensor shape for res[1]")
  }

  const boxes = tf.tidy(() => {
    const w = transRes.slice([0, 2], [-1, 1])
    const h = transRes.slice([0, 3], [-1, 1])
    const x1 = tf.sub(transRes.slice([0, 0], [-1, 1]), tf.div(w, 2)) // x1
    const y1 = tf.sub(transRes.slice([0, 1], [-1, 1]), tf.div(h, 2)) // y1
    return tf
      .concat(
        [
          y1,
          x1,
          tf.add(y1, h), // y2
          tf.add(x1, w), // x2
        ],
        1
      )
      .reshape([-1, 4]) // reshape to [numBoxes, 4]
  })

  // Ensure scores are 1D tensor
  const [scores, classes] = tf.tidy(() => {
    const shape = transRes.shape
    const numClass = shape[1] - 4 // adjust numClass based on the shape of the tensor
    const rawScores = transRes.slice([0, 4], [-1, numClass]).reshape([-1])
    return [rawScores.max(), rawScores.argMax()]
  }) as [tf.Tensor1D, tf.Tensor1D]

  // Perform non-max suppression
  const nms = await tf.image.nonMaxSuppressionAsync(
    boxes as any,
    scores as any,
    500,
    0.45,
    0.2
  )

  const detReady = tf.tidy(() =>
    tf.concat(
      [
        boxes.gather(nms, 0),
        scores.gather(nms, 0).expandDims(1),
        classes.gather(nms, 0).expandDims(1),
      ],
      1 // axis
    )
  ) // indexing selected boxes, scores and classes from NMS result

  const masks = tf.tidy(() => {
    const sliced = transRes
      .slice([0, 4 + numClass], [-1, modelSegChannel])
      .squeeze() // slice mask from every detection [m, mask_size]
    return sliced
      .gather(nms, 0) // get selected mask from NMS result
      .matMul(transSegMask.reshape([modelSegChannel, -1])) // matmul mask with segmentation mask result [n, mask_size] x [mask_size, h x w] => [n, h x w]
      .reshape([nms.shape[0], modelSegHeight, modelSegWidth]) // reshape back [n, h x w] => [n, h, w]
  }) // processing mask

  const toDraw = [] // list boxes to draw
  let overlay = tf.zeros([modelHeight, modelWidth, 4]) // initialize overlay to draw mask

  for (let i = 0; i < detReady.shape[0]; i++) {
    const rowData = detReady.slice([i, 0], [1, 6]) // get every first 6 element from every row
    const [y1, x1, y2, x2, score, label] = Array.from(rowData.dataSync()) // [y1, x1, y2, x2, score, label]
    const color = colors.get(label) // get label color

    const downSampleBox = [
      Math.floor((y1 * modelSegHeight) / modelHeight), // y
      Math.floor((x1 * modelSegWidth) / modelWidth), // x
      Math.round(((y2 - y1) * modelSegHeight) / modelHeight), // h
      Math.round(((x2 - x1) * modelSegWidth) / modelWidth), // w
    ] // downsampled box (box ratio at model output)
    const upSampleBox = [
      Math.floor(y1 * yRatio), // y
      Math.floor(x1 * xRatio), // x
      Math.round((y2 - y1) * yRatio), // h
      Math.round((x2 - x1) * xRatio), // w
    ] // upsampled box (box ratio to draw)

    const proto = tf.tidy(() => {
      const sliced = masks.slice(
        [
          i,
          downSampleBox[0] >= 0 ? downSampleBox[0] : 0,
          downSampleBox[1] >= 0 ? downSampleBox[1] : 0,
        ],
        [
          1,
          downSampleBox[0] + downSampleBox[2] <= modelSegHeight
            ? downSampleBox[2]
            : modelSegHeight - downSampleBox[0],
          downSampleBox[1] + downSampleBox[3] <= modelSegWidth
            ? downSampleBox[3]
            : modelSegWidth - downSampleBox[1],
        ]
      )
      return sliced.reshape([sliced.shape[1], sliced.shape[2], 1]) // slicing mask to boxes and reshape to [h, w, 1]
    })
    const upsampleProto = tf.image.resizeBilinear(proto, [
      upSampleBox[2],
      upSampleBox[3],
    ]) // resizing proto to drawing size
    const mask = tf.tidy(() => {
      const padded = upsampleProto.pad([
        [upSampleBox[0], modelHeight - (upSampleBox[0] + upSampleBox[2])],
        [upSampleBox[1], modelWidth - (upSampleBox[1] + upSampleBox[3])],
        [0, 0],
      ]) // padding proto to canvas size
      return padded.less(0.5) // make boolean mask from proto to indexing overlay
    }) // final boolean mask
    overlay = tf.tidy(() => {
      const newOverlay = overlay.where(mask, [
        ...Colors.hexToRgba(color, 0.5),
        150,
      ]) // indexing overlay from mask with RGBA code
      overlay.dispose() // dispose old overlay tensor (free memory)
      return newOverlay // return new overlay
    }) // new overlay

    toDraw.push({
      box: upSampleBox,
      score: score,
      klass: label,
      label: labels[label],
      color: color,
    }) // push box information to draw later

    tf.dispose([rowData, proto, upsampleProto, mask]) // dispose unused tensor to free memory
  }

  const maskImg = new ImageData(
    new Uint8ClampedArray(await overlay.data()), // tensor to array
    modelHeight,
    modelWidth
  ) // create image data from mask overlay

  const ctx = canvasRef.getContext("2d")
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clean canvas
  ctx.putImageData(maskImg, 0, 0) // render overlay to canvas

  renderBoxes(ctx, toDraw) // render boxes

  callback() // run callback function

  tf.engine().endScope() // end of scoping
}

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const segmentVideo = (vidSource, model, canvasRef) => {
  /**
   * Function to detect every frame from video
   */
  const detect = async () => {
    if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
      const ctx = canvasRef.getContext("2d")
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // clean canvas
      return // handle if source is closed
    }

    detectFrame(vidSource, model, canvasRef, () => {
      requestAnimationFrame(detect) // get another frame
    })
  }

  detect() // initialize to detect every frame
}
