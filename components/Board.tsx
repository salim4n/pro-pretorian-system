"use client"

import { type ObjectDetection } from "@tensorflow-models/coco-ssd";
import { useTfjsBackendWeb } from "@/hooks/use-tfjs-backend";
import useCocoSsd from "@/hooks/use-cocossd";
import ModelSelection from "./model-selection";
import ModelLoader from "./model-loader";
import { ModelComputerVision, modelList } from "@/models/model-list";
import CameraCard from "./camera-card";
import useBoardDetection from "@/hooks/use-board-detection";
import useCamerasConfig from "@/hooks/use-cameras-config";
import { getCameraByDeviceId } from "@/lib/data/local-storage/camera-store";
import {
	ifDontHaveDetectionZone,
	ifHaveDetectionZone,
} from "@/lib/helper-board/helper";
import useYolodisTfjs from "@/hooks/use-yolo-tfjs";
import { useModelStore } from "@/lib/store/model-store";
import { yolodetectVideo } from "@/lib/yolov8n/detect";
import { useYoloBoardDetectStore } from "@/lib/store/yolo-board-detect";

export default function Board({ user }) {
	const ready = useTfjsBackendWeb({ backend: "webgl" });
	const { modelName } = useModelStore();
	const { cocoSsd, loadCoco } = useCocoSsd({ ready });
	const { loadModel, model, percentLoaded, setDisposeDetect } = useYolodisTfjs({
		ready,
	});
	console.log(model);
	const { webcamRefs, cameras } = useCamerasConfig();
	useBoardDetection({
		ready,
		net:
			modelName === ModelComputerVision.COCO_SSD
				? cocoSsd
				: modelName === ModelComputerVision.DETECTION
				? model
				: null,
		runObjectDetection,
	});

	async function runObjectDetection(
		net: ObjectDetection | { net: any; inputShape: number[] },
	) {
		console.log("run obj detection");
		webcamRefs.current.forEach(async (webcam) => {
			let objectDetected;
			if (webcam !== null && webcam.video?.readyState === 4) {
				const deviceId = (webcam.props.videoConstraints as any).deviceId;
				const cameraStorage = getCameraByDeviceId(deviceId);
				if (cameraStorage?.noDetectTime?.length === 8) {
					// check if the time is between the noDetectTime, split by 4 : HHmm - HHmm
					const now = new Date();
					const nowHours = now.getHours();
					const nowMinutes = now.getMinutes();
					const nowTime = `${nowHours}${nowMinutes}`;
					const [start, end] = cameraStorage.noDetectTime.match(/.{1,4}/g);
					if (nowTime >= start && nowTime <= end) {
						console.log("no detect time");
						return;
					}
				}
				console.log("detecting");
				if (modelName === ModelComputerVision.COCO_SSD) {
					objectDetected = await cocoSsd.detect(webcam.video, undefined, 0.1);
				} else if (modelName === ModelComputerVision.DETECTION) {
					await yolodetectVideo(webcam.video, net);
					objectDetected = useYoloBoardDetectStore.getState().yoloDetected;
				}
				console.log("in board", objectDetected);
				if (cameraStorage.detectionZone !== null) {
					ifHaveDetectionZone(
						cameraStorage,
						objectDetected,
						webcam,
						user,
						modelName,
					);
				} else {
					ifDontHaveDetectionZone(objectDetected, webcam, user, modelName);
				}
			}
		});
	}

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 mt-10">
			{loadCoco || loadModel ? (
				<ModelLoader
					model={modelList.find(
						(model) =>
							model.title === ModelComputerVision.COCO_SSD ||
							ModelComputerVision.DETECTION,
					)}
					percent={percentLoaded && percentLoaded}
				/>
			) : (
				<ModelSelection />
			)}
			{cameras.map((camera, index) => (
				<CameraCard
					key={index}
					camera={camera}
					index={index}
					webcamRefs={webcamRefs}
				/>
			))}
		</div>
	);
}

