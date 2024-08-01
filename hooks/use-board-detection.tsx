import { ObjectDetection } from "@tensorflow-models/coco-ssd"
import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"

interface IProps {
  ready: boolean
  net: ObjectDetection
  runObjectDetection: (net: ObjectDetection) => void
}

export default function useBoardDetection({
  ready,
  net,
  runObjectDetection,
}: IProps) {
  useEffect(() => {
    if (!ready) return
    if (net) {
      const detectInterval = setInterval(() => {
        runObjectDetection(net)
      }, 3000)

      return () => {
        clearInterval(detectInterval)
      }
    }
  }, [net, ready])
}
