import { useModelStore } from "@/lib/store/model-store" // Importation du store de modèle
import { ModelComputerVision, modelList } from "@/models/model-list" // Importation des modèles de vision par ordinateur
import { useEffect, useState } from "react" // Importation des hooks React
import * as tf from "@tensorflow/tfjs" // Importation de TensorFlow.js

interface IProps {
  ready: boolean // Propriété indiquant si le modèle est prêt
}

export type YoloModel = {
  net: tf.GraphModel<string | tf.io.IOHandler | null> // Le modèle de réseau de neurones
  inputShape: number[] // La forme de l'entrée du modèle
}

export default function useYolodisTfjs({ ready }: IProps) {
  const { modelName } = useModelStore() // Récupération du nom du modèle depuis le store
  const [model, setModel] = useState<YoloModel>({
    net: null,
    inputShape: [1, 0, 0, 3],
  }) // Initialisation du modèle et de la forme de l'entrée
  const [loadModel, setLoadModel] = useState<boolean>(false) // État pour indiquer si le modèle est en cours de chargement
  const [disposeDetect, setDisposeDetect] = useState<boolean>(false) // État pour indiquer si le modèle doit être supprimé
  const [percentLoaded, setPercentLoaded] = useState<number>(0) // État pour indiquer le pourcentage de chargement du modèle

  const modelDef = modelList.find(model => model.title === modelName) // Recherche de la définition du modèle dans la liste des modèles

  async function fetchModel() {
    if (modelName === ModelComputerVision.DETECTION) {
      setLoadModel(true) // Début du chargement du modèle
      const yolov8 = await tf.loadGraphModel(modelDef.url, {
        onProgress: fractions => {
          setPercentLoaded(fractions * 100) // Mise à jour du pourcentage de chargement
        },
      }) // Chargement du modèle
      // Préparation du modèle
      const dummyInput = tf.ones(yolov8.inputs[0].shape) // Création d'une entrée factice
      const warmupResults = yolov8.execute(dummyInput) // Exécution du modèle avec l'entrée factice
      setModel({
        net: yolov8,
        inputShape: yolov8.inputs[0].shape,
      }) // Mise à jour du modèle et de la forme de l'entrée
      tf.dispose([warmupResults, dummyInput]) // Nettoyage de la mémoire
      setLoadModel(false) // Fin du chargement du modèle
    }
  }

  useEffect(() => {
    if (ready) {
      fetchModel() // Chargement du modèle si prêt
    }

    if (modelName === ModelComputerVision.EMPTY) {
      setModel({
        net: null,
        inputShape: [1, 0, 0, 3],
      }) // Réinitialisation du modèle
      model.net?.dispose() // Suppression du modèle existant
    }
  }, [ready, modelName]) // Dépendances du hook useEffect

  function disposeModel() {
    disposeDetect && tf.disposeVariables() // Suppression des variables TensorFlow si nécessaire
    tf.dispose() // Suppression de TensorFlow
  }

  useEffect(() => {
    disposeModel() // Suppression du modèle si disposeDetect change
  }, [disposeDetect]) // Dépendance du hook useEffect

  return { model, loadModel, percentLoaded, setDisposeDetect } // Retourne les états et fonctions nécessaires
}
