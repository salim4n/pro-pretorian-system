import * as tf from "@tensorflow/tfjs"
import { renderBoxes } from "./renderBox"
import { cocoDataSet } from "../model-detection/yolo-test/label"
import {
	useYoloBoardDetectStore,
	YoloDetected,
} from "../store/yolo-board-detect";

const numClass = cocoDataSet.length;
//commit
/**
 * Preprocess image / frame before forwarded into the model
 * @param {HTMLVideoElement|HTMLImageElement} source
 * @param {Number} modelWidth
 * @param {Number} modelHeight
 * @returns input tensor, xRatio and yRatio
 */
const preprocess = (source, modelWidth, modelHeight) => {
	let xRatio, yRatio; // ratios for boxes

	const input = tf.tidy(() => {
		const img = tf.browser.fromPixels(source);

		// padding image to square => [n, m] to [n, n], n > m
		const [h, w] = img.shape.slice(0, 2); // get source width and height
		const maxSize = Math.max(w, h); // get max size
		const imgPadded = img.pad([
			[0, maxSize - h], // padding y [bottom only]
			[0, maxSize - w], // padding x [right only]
			[0, 0],
		]);

		xRatio = maxSize / w; // update xRatio
		yRatio = maxSize / h; // update yRatio

		return tf.image
			.resizeBilinear(imgPadded as any, [modelWidth, modelHeight]) // resize frame
			.div(255.0) // normalize
			.expandDims(0); // add batch
	});

	return [input, xRatio, yRatio];
};

/**
 * Function run inference and do detection from source.
 * @param {HTMLImageElement|HTMLVideoElement} source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 * @param {VoidFunction} callback function to run after detection process
 */
export const detect = async (source, model, canvasRef, callback = () => {}) => {
	if (model === null) return;
	const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height

	tf.engine().startScope(); // start scoping tf engine
	const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // preprocess image

	const res = model.net.execute(input); // inference model
	const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
	const boxes = tf.tidy(() => {
		const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
		const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
		const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
		const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
		return tf
			.concat(
				[
					y1,
					x1,
					tf.add(y1, h), //y2
					tf.add(x1, w), //x2
				],
				2,
			)
			.squeeze();
	}); // process boxes [y1, x1, y2, x2]

	const [scores, classes] = tf.tidy(() => {
		// class scores
		const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
		return [rawScores.max(1), rawScores.argMax(1)];
	}); // get max scores and classes index

	const nms = await tf.image.nonMaxSuppressionAsync(
		boxes as any,
		scores,
		500,
		0.45,
		0.2,
	); // NMS to filter boxes

	const boxes_data = boxes?.gather(nms, 0).dataSync(); // indexing boxes by nms index
	const scores_data = scores?.gather(nms, 0).dataSync(); // indexing scores by nms index
	const classes_data = classes?.gather(nms, 0).dataSync(); // indexing classes by nms index
	canvasRef &&
		renderBoxes(
			source,
			canvasRef,
			boxes_data as any,
			scores_data,
			classes_data,
			[xRatio, yRatio],
		); // render boxes if canvasRef

	tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory
	callback();
	tf.engine().endScope(); // end of scoping

	return { boxes: boxes_data, scores: scores_data, classes: classes_data };
};

/**
 * Function to detect video from every source.
 * @param {HTMLVideoElement} vidSource video source
 * @param {tf.GraphModel} model loaded YOLOv8 tensorflow.js model
 * @param {HTMLCanvasElement} canvasRef canvas reference
 */
export const yolodetectVideo = async (
	vidSource: any,
	model: any,
	canvasRef?: any,
) => {
	/**
	 * Function to detect every frame from video
	 */
	const detectFrame = async () => {
		if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
			const ctx = canvasRef?.getContext("2d"); // get canvas context
			ctx?.clearRect(0, 0, ctx?.canvas.width, ctx?.canvas.height); // clean canvas
			return; // handle if source is closed
		}

		const { boxes, scores, classes } = await detect(
			vidSource,
			model,
			canvasRef,
			() => {
				requestAnimationFrame(detectFrame); // get another frame
			},
		);

		useYoloBoardDetectStore.getState().setYoloDetected([]); // clear previous detection

		// Check if the detection results are valid and we are not in detect in video 
		if (boxes && scores && classes && !canvasRef) {
			// Ensure the lengths are consistent
			if (boxes.length % 4 === 0 && scores.length === classes.length) {
				// Process each detection
				const detections = [];
				for (let i = 0; i < scores.length; i++) {
					const score = scores[i];
					const classId = classes[i];
					const box = boxes.slice(i * 4, (i + 1) * 4);
					const detection: YoloDetected = {
						class: cocoDataSet[classId],
						score: score,
						bbox: [box[0], box[1], box[2], box[3]],
					};
					detections.push(detection);
					useYoloBoardDetectStore.getState().setYoloDetected(detections);
					// console.log("Detection:", detection);
				}
			}
		} else {
			// Clear the detections if there are no results
			useYoloBoardDetectStore.getState().setYoloDetected([]);
		}
	};

	await detectFrame(); // initialize to detect every frame
};
