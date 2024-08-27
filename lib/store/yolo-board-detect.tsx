import { create } from "zustand";

export type YoloDetected = {
	class: string;
	score: number;
	bbox: [number, number, number, number];
};

type YoloBoardDetectStore = {
	yoloDetected: YoloDetected[];
	setYoloDetected: (yoloDetected: YoloDetected[]) => void;
};

export const useYoloBoardDetectStore = create<YoloBoardDetectStore>((set) => ({
	yoloDetected: [],
	setYoloDetected: (yoloDetected) => set({ yoloDetected }),
}));
