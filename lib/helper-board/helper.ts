import { DetectedObject } from "@tensorflow-models/coco-ssd";
import { sendPicture } from "../send-detection/action";
import Webcam from "react-webcam";
import {
	getModelDetectionStorage,
	LabelToDetect,
} from "../data/local-storage/model-detection-store";
import { ModelComputerVision } from "@/models/model-list";
import { CameraStored } from "../data/local-storage/camera-store";
import { UserView } from "../identity/definition";
import { YoloDetected } from "../store/yolo-board-detect";
import { useModelStore } from "../store/model-store";

function isDetectionInZone(
	detection,
	zone,
	videoWidth,
	videoHeight,
	canvasWidth,
	canvasHeight,
) {
	const [x, y, width, height] = detection;
	const { x: zoneX, y: zoneY, width: zoneWidth, height: zoneHeight } = zone;

	const xRatio = canvasWidth / videoWidth;
	const yRatio = canvasHeight / videoHeight;

	const canvasX = x * xRatio;
	const canvasY = y * yRatio;
	const canvasWidthDetection = width * xRatio;
	const canvasHeightDetection = height * yRatio;

	const zoneRight = zoneX + zoneWidth;
	const zoneBottom = zoneY + zoneHeight;

	const detectionPoints = [
		{ x: canvasX, y: canvasY }, // top left
		{ x: canvasX + canvasWidthDetection, y: canvasY }, // top right
		{ x: canvasX, y: canvasY + canvasHeightDetection }, // bottom left
		{ x: canvasX + canvasWidthDetection, y: canvasY + canvasHeightDetection }, // bottom right
	];

	return detectionPoints.some(
		(point) =>
			point.x >= zoneX &&
			point.x <= zoneRight &&
			point.y >= zoneY &&
			point.y <= zoneBottom,
	);
}

async function ifHaveDetectionZone(
	cameraStorage: CameraStored,
	objDetected: DetectedObject[],
	webcam: Webcam,
	user: UserView,
	modelName: ModelComputerVision,
) {
	let isIn = false;
	for (const o of objDetected) {
		isIn = isDetectionInZone(
			o.bbox,
			cameraStorage.detectionZone,
			webcam.video.videoWidth,
			webcam.video.videoHeight,
			webcam.video.offsetWidth,
			webcam.video.offsetHeight,
		);
		if (isIn) {
			break;
		}
	}
	const detectionStorage = getModelDetectionStorage(modelName);
	if (
		objDetected.find((o) =>
			detectionStorage.labelsToDetect.find((label) => label.label === o.class),
		) &&
		isIn
	) {
		const body = {
			detected: objDetected,
			picture: webcam.getScreenshot({ width: 640, height: 480 }),
		};
		console.log("body", body);
		await sendPicture(body, user);
	}
}

async function ifDontHaveDetectionZone(
	objDetected: DetectedObject[] | YoloDetected[],
	webcam: Webcam,
	user: UserView,
	modelName: ModelComputerVision,
) {
	const detectionStorage = getModelDetectionStorage(modelName);
	console.log("stored to detect", detectionStorage);
	console.log("object detected", objDetected);
	const detectedIsInStorage = objDetected?.find((od: any) =>
		detectionStorage.labelsToDetect.find(
			(ltd: LabelToDetect) => ltd.label === od.class && ltd.toDetect,
		),
	);
	if (detectedIsInStorage) {
		console.log("detected", objDetected);
		console.log(
			"is in labels to detect",
			detectionStorage.labelsToDetect.find(
				(ltd: LabelToDetect) => ltd.toDetect,
			),
		);
		const body = {
			detected: objDetected,
			picture: webcam.getScreenshot({ width: 640, height: 640 }),
		};
		await sendPicture(body, user);
	} else {
		console.log("no detection");
	}
}

export { ifDontHaveDetectionZone, ifHaveDetectionZone };
