export enum ModelComputerVision {
  COCO_SSD = "Coco SSD",
  DETECTION = "Detection",
  SEGMENTATION = "Segmentation",
  CLASSIFICATION = "Classification",
}

export type ModelList = {
  title: ModelComputerVision
  url: string
  description: string
}

export const modelList: ModelList[] = [
  {
    title: ModelComputerVision.COCO_SSD,
    url: "https://tfhub.dev/tensorflow/coco-ssd/1/default/1",
    description:
      "Object detection model that aims to localize and identify multiple objects in a single image.",
  },
  {
    title: ModelComputerVision.DETECTION,
    url: "https://huggingface.co/salim4n/yolov8n_web_model/resolve/main/model.json",
    description:
      "Object detection model that aims to localize and identify multiple objects in a single image.",
  },
  {
    title: ModelComputerVision.SEGMENTATION,
    url: "https://tfhub.dev/tensorflow/deeplabv3_mnv2_pascal/1/default/1",
    description:
      "Semantic segmentation model that assigns a label to each pixel in the image.",
  },
  {
    title: ModelComputerVision.CLASSIFICATION,
    url: "https://tfhub.dev/google/imagenet/mobilenet_v2_130_224/classification/4/default/1",
    description:
      "Image classification model that predicts the object in an image.",
  },
]
