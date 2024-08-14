import React from "react"
import { PictureStored } from "@/lib/send-detection/action"
import { Badge } from "./ui/badge"

interface IProps {
  pictures: PictureStored[]
}

export default function DisplayHistory({ pictures }: IProps) {
  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Picture History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {pictures?.map((pic, i) => (
          <div
            key={i}
            className="bg-background rounded-lg overflow-hidden  group">
            <img
              src={pic.url}
              alt={`Picture ${i + 1}`}
              width="400"
              height="400"
              className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity"
              style={{ aspectRatio: "400/400", objectFit: "cover" }}
            />
            <div className="p-4">
              <Badge className="mb-2 cursor-default">{pic.detectedClass}</Badge>
              <p className="text-muted-foreground text-sm">
                Uploaded on {new Date(pic.created).toDateString()} at {pic.hour}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
