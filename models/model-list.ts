export enum ModelComputerVision {
	COCO_SSD = "Detection d'objets ordinaires",
	DETECTION = "Yolo detection ordinaires",
	EMPTY = "",
}

export type ModelList = {
	title: ModelComputerVision;
	url: string;
	description: string;
	labels?: string;
};

export const modelList: ModelList[] = [
	{
		title: ModelComputerVision.COCO_SSD,
		url: "https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1",
		description:
			"Detection d'objets classiques dans des images. Ce modèle est capable de détecter 80 classes d'objets de la base de données COCO (Common Objects in Context).",
		labels: "basic",
	},
	{
		title: ModelComputerVision.DETECTION,
		url: "https://huggingface.co/salim4n/yolov8n_web_model/resolve/main/model.json",
		description:
			"Detection d'objets classiques dans des images. Ce modèle est capable de détecter 80 classes d'objets de la base de données COCO (Common Objects in Context).",
		labels: "basic",
	},

	{
		title: ModelComputerVision.EMPTY,
		url: "",
		description: "",
		labels: "",
	},
];
