import * as tf from "@tensorflow/tfjs"

import { useEffect, useState } from "react"

export type TfBackend = "webgl" | "cpu" | "wasm"

interface ITfjsBackend {
  backend: TfBackend
}

export const useTfjsBackendWeb = ({ backend }: ITfjsBackend) => {
  const [tfReady, setTfReady] = useState(false)
  useEffect(() => {
    tf.ready().then(() => {
      tf.getBackend() !== backend && tf.setBackend(backend)
      setTfReady(true)
    })

    return () => {
      tf.disposeVariables()
      tf.dispose()
    }
  }, [backend, tf.disposeVariables, tf.dispose])

  return tfReady
}
