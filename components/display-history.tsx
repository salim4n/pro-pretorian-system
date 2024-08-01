import { Card, CardContent } from "./ui/card"
import Image from "next/image"

interface IProps {
  pictures: string[]
  canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>
}

export default function DisplayHistory({ pictures, canvasRefs }: IProps) {
  return (
    <Card className="m-3 w-full lg:col-span-2 flex-grow bg-transparent border-none">
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8">
          {pictures.map((picture, index) => (
            <div key={index} className="relative">
              <Image
                src={picture}
                alt={"Image de la détection"}
                width={300}
                height={300}
                className="rounded-lg w-full cursor-pointer text-center transition duration-500"
              />
              <canvas
                // @ts-ignore
                ref={el => (canvasRefs.current[index] = el!)}
                width={300}
                height={300}
                className="absolute top-0 left-0 rounded-lg w-full h-full cursor-pointer text-center transition duration-500 z-50"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
