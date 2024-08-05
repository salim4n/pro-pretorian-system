import { ModelConfig } from "./type"
import { YoloV5 } from "./yolov5"
import { YoloV8 } from "./yolov8"

const createYoloDataExtractor = (classes: string[], config: ModelConfig) => {
  switch (config.yoloVersion) {
    case "v5":
      return new YoloV5(classes)
    case "v8":
      return new YoloV8(classes)
  }
}

export default createYoloDataExtractor
