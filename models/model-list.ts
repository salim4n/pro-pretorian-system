export enum ModelComputerVision {
  COCO_SSD = "Coco SSD",
  DETECTION = "Detection",
  SEGMENTATION = "Segmentation",
}

export type ModelList = {
  title: ModelComputerVision
  url: string
  description: string
  labels?: string
}

export const modelList: ModelList[] = [
  {
    title: ModelComputerVision.COCO_SSD,
    url: "https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1",
    description:
      "Object detection model that aims to localize and identify multiple objects in a single image.",
    labels: "basic",
  },
  {
    title: ModelComputerVision.DETECTION,
    url: "https://huggingface.co/salim4n/yolov8n_web_model/resolve/main/model.json",
    description:
      "Object detection model that aims to localize and identify multiple objects in a single image.",
    labels: "basic",
  },
  {
    title: ModelComputerVision.SEGMENTATION,
    url: "https://huggingface.co/salim4n/yolov8n-segment-web/resolve/main/model.json",
    description:
      "Semantic segmentation model that assigns a label to each pixel in the image.",
    labels: "basic",
  },
]
