import { NamedTensorMap } from "@tensorflow/tfjs"

export type YoloVersion = "v5" | "v8"

export interface ModelConfig {
  scoreThreshold?: number
  iouThreshold?: number
  maxOutputSize?: number
  onProgress?: (fraction: number) => void
  yoloVersion: YoloVersion
}

export interface PreprocessResult {
  input: NamedTensorMap
  xRatio: number
  yRatio: number
}

export type PreprocessImage = (
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
) => PreprocessResult

export type PredictionData = {
  boxes: Float32Array | Int32Array | Uint8Array
  scores: Float32Array | Int32Array | Uint8Array
  classes: Float32Array | Int32Array | Uint8Array
  ratio: [number, number]
}
