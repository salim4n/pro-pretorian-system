import { ObjectDetection } from "@tensorflow-models/coco-ssd"
import { useEffect } from "react"

interface IProps {
	ready: boolean;
	net: ObjectDetection | { net: any; inputShape: number[] };
	runObjectDetection: (
		net: ObjectDetection | { net: any; inputShape: number[] },
	) => void;
}

export default function useBoardDetection({
	ready,
	net,
	runObjectDetection,
}: IProps) {
	useEffect(() => {
		if (!ready) return;
		if (net) {
			const detectInterval = setInterval(() => {
				runObjectDetection(net);
			}, 100);

			return () => {
				clearInterval(detectInterval);
			};
		}
	}, [net, ready]);
}
