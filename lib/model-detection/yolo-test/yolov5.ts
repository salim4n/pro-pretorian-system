import { concat, Rank, Tensor, tidy } from "@tensorflow/tfjs"
import { YoloStrategy } from "./yoloStrategy"

export class YoloV5 extends YoloStrategy {
  getPredictionData(output: Tensor<Rank> | Tensor[]) {
    const [boxes, scores, classes] = (output as Tensor[]).slice(0, 3)

    const proceedBoxes = tidy(() => {
      const x1 = boxes.slice([0, 0, 0], [-1, -1, 1]).mul(640)
      const y1 = boxes.slice([0, 0, 1], [-1, -1, 1]).mul(640)
      const x2 = boxes.slice([0, 0, 2], [-1, -1, 1]).mul(640)
      const y2 = boxes.slice([0, 0, 3], [-1, -1, 1]).mul(640)

      return concat([x1, y1, x2, y2], 2).squeeze()
    }) as Tensor<Rank.R2>

    return {
      boxes: proceedBoxes,
      scores: scores.squeeze() as Tensor<Rank.R1>,
      classes,
    }
  }
}
