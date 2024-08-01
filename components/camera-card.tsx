import Webcam from "react-webcam"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useEffect, useRef, useState } from "react"
import {
  getCameraByDeviceId,
  updateCameraInLocalStorage,
} from "@/lib/data/local-storage/camera-store"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./ui/input-otp"
import { Badge } from "./ui/badge"

interface IProps {
  camera: MediaDeviceInfo
  index: number
  webcamRefs: React.MutableRefObject<Webcam[]>
}

export default function CameraCard({ camera, index, webcamRefs }: IProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [otpTime, setOtpTime] = useState(() => {
    const cameraStorage = getCameraByDeviceId(camera.deviceId)
    return cameraStorage.noDetectTime || ""
  })

  const stockOtpTime = () => (otpTime.length === 8 ? otpTime : null)

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setIsDrawing(true)
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDrawing(false)
    if (!startPos || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top

    const width = Math.abs(endX - startPos.x)
    const height = Math.abs(endY - startPos.y)
    console.log("width, height", width, height)
    if (width === 0 && height === 0) {
      const cameraStorage = getCameraByDeviceId(camera.deviceId)
      if (cameraStorage.haveDetectionZone) {
        // Supprimer la zone de détection
        updateCameraInLocalStorage(index, {
          noDetectTime: stockOtpTime(),
          deviceId: camera.deviceId,
          label: camera.label,
          haveDetectionZone: false,
          detectionZone: null,
        })
      }
    } else {
      updateCameraInLocalStorage(index, {
        noDetectTime: stockOtpTime(),
        deviceId: camera.deviceId,
        label: camera.label,
        haveDetectionZone: true,
        detectionZone: { x: startPos.x, y: startPos.y, width, height },
      })
    }
    setStartPos(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    ctx.strokeStyle = "red"
    ctx.lineWidth = 2
    ctx.strokeRect(
      startPos.x,
      startPos.y,
      currentX - startPos.x,
      currentY - startPos.y
    )
  }

  useEffect(() => {
    const cameraStorage = getCameraByDeviceId(camera.deviceId)
    console.log("cameraStorage", cameraStorage)
    if (cameraStorage.haveDetectionZone && canvasRef.current) {
      console.log("draw detection zone")
      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      const { x, y, width, height } = cameraStorage.detectionZone
      console.log("x, y, width, height", x, y, width, height)
      ctx.strokeStyle = "red"
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, width, height)
    }
  }, [camera])

  return (
    <Card key={index} className="flex flex-col items-center mt-5">
      <CardHeader>
        <h4>Heure sans detections</h4>
      </CardHeader>
      <CardContent>
        <InputOTP
          maxLength={8}
          value={otpTime}
          onChange={value => {
            setOtpTime(value)
            const thisCam = getCameraByDeviceId(camera.deviceId)
            updateCameraInLocalStorage(index, {
              noDetectTime: value.length === 8 ? value : null,
              deviceId: camera.deviceId,
              label: camera.label,
              haveDetectionZone: thisCam.haveDetectionZone,
              detectionZone: thisCam.detectionZone,
            })
          }}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <Badge>
              <strong>H</strong>
            </Badge>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
            <Badge>
              <strong>H</strong>
            </Badge>
            <InputOTPSlot index={6} />
            <InputOTPSlot index={7} />
          </InputOTPGroup>
        </InputOTP>
      </CardContent>
      <CardContent>
        <div className="relative">
          <Webcam
            audio={false}
            videoConstraints={{
              deviceId: camera.deviceId,
            }}
            ref={el => {
              if (el) {
                webcamRefs.current[index] = el
              }
            }}
            key={index}
            width={640}
            height={480}
            className="m-1 rounded-md border-gray-500 border-2"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 z-10 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          />
        </div>
      </CardContent>
    </Card>
  )
}
