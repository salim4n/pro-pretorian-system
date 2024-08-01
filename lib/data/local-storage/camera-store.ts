export const cameraStorageTitle = "pro-proterian-cameras"

export type CameraStored = {
  deviceId?: string
  label?: string
  noDetectTime?: string
  //enabled: boolean
  haveDetectionZone?: boolean
  detectionZone?: { x: number; y: number; width: number; height: number }
}

function createCameraStorage() {
  localStorage.setItem(cameraStorageTitle, "[]")
}

function addCameraToLocalStorage(camera: CameraStored) {
  const storedCameras = JSON.parse(
    localStorage.getItem(cameraStorageTitle) || "[]"
  )
  storedCameras.push(camera)
  localStorage.setItem(cameraStorageTitle, JSON.stringify(storedCameras))
}

function updateCameraInLocalStorage(index: number, camera: CameraStored) {
  const storedCameras = JSON.parse(
    localStorage.getItem(cameraStorageTitle) || "[]"
  )
  storedCameras[index] = camera
  localStorage.setItem(cameraStorageTitle, JSON.stringify(storedCameras))
}

function removeCameraFromLocalStorage(index: number) {
  const storedCameras = JSON.parse(
    localStorage.getItem(cameraStorageTitle) || "[]"
  )
  storedCameras.splice(index, 1)
  localStorage.setItem(cameraStorageTitle, JSON.stringify(storedCameras))
}

function getAllCamerasFromLocalStorage(): CameraStored[] {
  return JSON.parse(localStorage.getItem(cameraStorageTitle) || "[]")
}

function getCameraByDeviceId(deviceId: string): CameraStored | undefined {
  const storedCameras = JSON.parse(
    localStorage.getItem(cameraStorageTitle) || "[]"
  )
  return storedCameras.find(camera => camera.deviceId === deviceId)
}

export {
  createCameraStorage,
  addCameraToLocalStorage,
  updateCameraInLocalStorage,
  removeCameraFromLocalStorage,
  getAllCamerasFromLocalStorage,
  getCameraByDeviceId,
}
