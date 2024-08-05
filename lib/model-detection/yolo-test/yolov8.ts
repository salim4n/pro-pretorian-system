import {
  add,
  concat,
  dispose,
  div,
  Rank,
  sub,
  Tensor,
  TensorContainer,
  tidy,
} from "@tensorflow/tfjs"
import { YoloStrategy } from "./yoloStrategy"

export class YoloV8 extends YoloStrategy {
  getPredictionData(output: Tensor<Rank> | Tensor[]) {
    const prediction = (output as Tensor<Rank>).transpose([0, 2, 1])

    const boxes = tidy(() => {
      const width = prediction.slice([0, 0, 2], [-1, -1, 1])
      const height = prediction.slice([0, 0, 3], [-1, -1, 1])
      const x1 = sub(prediction.slice([0, 0, 0], [-1, -1, 1]), div(width, 2))
      const y1 = sub(prediction.slice([0, 0, 1], [-1, -1, 1]), div(height, 2))
      const x2 = add(x1, width)
      const y2 = add(y1, height)
      return concat([x1, y1, x2, y2], 2).squeeze()
    }) as Tensor<Rank.R2>

    const [scores, classes] = tidy(() => {
      const scores = prediction
        .slice([0, 0, 4], [-1, -1, this.classes.length])
        .squeeze()
      return [scores.max(1), scores.argMax(1)]
    })

    dispose([prediction] as TensorContainer)

    return { boxes, scores, classes }
  }
}
