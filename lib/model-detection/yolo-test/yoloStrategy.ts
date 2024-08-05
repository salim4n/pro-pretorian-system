import { Rank, Tensor } from "@tensorflow/tfjs"

export type PredictionData = {
  boxes: Tensor<Rank>
  scores: Tensor<Rank>
  classes: Tensor<Rank>
}

export abstract class YoloStrategy {
  classes: string[]

  constructor(classes: string[]) {
    this.classes = classes
  }

  abstract getPredictionData(output: Tensor<Rank> | Tensor[]): PredictionData
}
