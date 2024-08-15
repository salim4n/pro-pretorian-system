// import { useModelStore } from "@/lib/store/model-store"
// import { ModelComputerVision, modelList } from "@/models/model-list"
// import { useEffect, useState } from "react"
// import * as tf from "@tensorflow/tfjs"

// interface IProps {
//   ready: boolean
// }

// export default function useYolodisTfjs({ ready }: IProps) {
//   const { modelName } = useModelStore()
//   const [model, setModel] = useState({
//     net: null,
//     inputShape: [1, 0, 0, 3],
//   }) // init model & input shape
//   const [loadModel, setLoadModel] = useState<boolean>(false)
//   const [disposeDetect, setDisposeDetect] = useState<boolean>(false)
//   const [percentLoaded, setPercentLoaded] = useState<number>(0)

//   const modelDef = modelList.find(model => model.title === modelName)

//   // async function fetchModel() {
//   //   if (modelName === ModelComputerVision.DETECTION) {
//   //     setLoadModel(true)
//   //     const yolov8 = await tf.loadGraphModel(modelDef.url, {
//   //       onProgress: fractions => {
//   //         setPercentLoaded(fractions * 100)
//   //       },
//   //     }) // load model
//   //     // warming up model
//   //     const dummyInput = tf.ones(yolov8.inputs[0].shape)
//   //     const warmupResults = yolov8.execute(dummyInput)
//   //     setModel({
//   //       net: yolov8,
//   //       inputShape: yolov8.inputs[0].shape,
//   //     }) // set model & input shape
//   //     tf.dispose([warmupResults, dummyInput]) // cleanup memory
//   //     setLoadModel(false)
//   //   }
//   // }

//   // useEffect(() => {
//   //   if (ready) {
//   //     fetchModel()
//   //   }

//     if (modelName === ModelComputerVision.EMPTY) {
//       setModel({
//         net: null,
//         inputShape: [1, 0, 0, 3],
//       })
//       model.net?.dispose()
//     }
//   }, [ready, modelName])

//   function disposeModel() {
//     disposeDetect && tf.disposeVariables()
//     tf.dispose()
//   }

//   useEffect(() => {
//     disposeModel()
//   }, [disposeDetect])

//   return { model, loadModel, percentLoaded, setDisposeDetect }
// }
